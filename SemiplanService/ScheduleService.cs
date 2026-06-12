namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Text;

public class ScheduleService
{
    private readonly ScheduleRepository _repository;
    private readonly ChapterRepository _chapterRepository;
    private readonly ProgressRepository _progressRepository;
    private readonly HttpClient _httpClient;
    private readonly string _geminiApiKey;

    private readonly SubjectRepository _subjectRepository;
    private readonly UserRepository _userRepository;
    private readonly UserAvailabilityRepository _userAvailabilityRepository;

    public ScheduleService(ScheduleRepository repository, ChapterRepository chapterRepository, ProgressRepository progressRepository, SubjectRepository subjectRepository, UserRepository userRepository, UserAvailabilityRepository userAvailabilityRepository, IConfiguration configuration)
    {
        _repository = repository;
        _chapterRepository = chapterRepository;
        _progressRepository = progressRepository;
        _subjectRepository = subjectRepository;
        _userRepository = userRepository;
        _userAvailabilityRepository = userAvailabilityRepository;
        _httpClient = new HttpClient();
        _geminiApiKey = configuration["Gemini:ApiKey"] ?? "";
    }

    public async Task<List<ScheduleResponseDto>> GetByUserIdAsync(int userId)
    {
        var schedules = await _repository.GetByUserIdAsync(userId);
        return schedules.Select(MapToResponse).ToList();
    }

    public async Task<List<ScheduleResponseDto>> GetByDateRangeAsync(int userId, DateTime from, DateTime to)
    {
        var schedules = await _repository.GetByDateRangeAsync(userId, from, to);
        return schedules.Select(MapToResponse).ToList();
    }

    public async Task<ScheduleResponseDto> AddScheduleAsync(ScheduleCreateDto dto)
    {
        var schedule = new Schedule
        {
            UserId = dto.UserId,
            SubjectId = dto.SubjectId,
            ChapterId = dto.ChapterId,
            Title = dto.Title,
            Description = dto.Description,
            Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            StartTime = TimeSpan.Parse(dto.StartTime),
            EndTime = TimeSpan.Parse(dto.EndTime),
            Duration = dto.Duration,
            Priority = dto.Priority,
            Status = ScheduleStatus.Pending,
            AiGenerated = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddScheduleAsync(schedule);
        var result = await _repository.GetByIdAsync(schedule.Id);
        return MapToResponse(result!);
    }

    public async Task<ScheduleResponseDto?> UpdateScheduleAsync(int id, ScheduleUpdateDto dto)
    {
        var schedule = await _repository.GetByIdAsync(id);
        if (schedule == null) return null;

        if (dto.Title != null) schedule.Title = dto.Title;
        if (dto.Description != null) schedule.Description = dto.Description;
        if (dto.Date.HasValue) schedule.Date = DateTime.SpecifyKind(dto.Date.Value, DateTimeKind.Utc);
        if (dto.StartTime != null) schedule.StartTime = TimeSpan.Parse(dto.StartTime);
        if (dto.EndTime != null) schedule.EndTime = TimeSpan.Parse(dto.EndTime);
        if (dto.Duration.HasValue) schedule.Duration = dto.Duration.Value;
        if (dto.Priority.HasValue) schedule.Priority = dto.Priority.Value;

        schedule.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateScheduleAsync(schedule);

        var result = await _repository.GetByIdAsync(id);
        return MapToResponse(result!);
    }

    public async Task UpdateStatusAsync(int id, ScheduleUpdateStatusDto dto)
    {
        var schedule = await _repository.GetByIdAsync(id);
        if (schedule == null) throw new Exception("Schedule not found");

        var oldStatus = schedule.Status;
        var newStatus = Enum.Parse<ScheduleStatus>(dto.Status, ignoreCase: true);

        if (oldStatus == newStatus) return;

        schedule.Status = newStatus;
        schedule.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateScheduleAsync(schedule);

        // Update Progress if it's a study session
        if (schedule.SubjectId.HasValue)
        {
            var progresses = await _progressRepository.GetByUserIdAsync(schedule.UserId);
            var progress = progresses.FirstOrDefault(p => p.SubjectId == schedule.SubjectId.Value);

            if (progress == null)
            {
                progress = new Progress
                {
                    UserId = schedule.UserId,
                    SubjectId = schedule.SubjectId.Value,
                    CompletedSessions = 0,
                    MissedSessions = 0,
                    StreakDays = 0,
                    TotalStudyHours = 0,
                    CompletionPercent = 0
                };
            }

            if (newStatus == ScheduleStatus.Completed && oldStatus != ScheduleStatus.Completed)
            {
                progress.CompletedSessions += 1;
                progress.TotalStudyHours += (schedule.Duration / 60);
                progress.LastStudiedAt = DateTime.UtcNow;
            }
            else if (oldStatus == ScheduleStatus.Completed && newStatus != ScheduleStatus.Completed)
            {
                progress.CompletedSessions = Math.Max(0, progress.CompletedSessions - 1);
                progress.TotalStudyHours = Math.Max(0, progress.TotalStudyHours - (schedule.Duration / 60));
            }

            if (newStatus == ScheduleStatus.Missed && oldStatus != ScheduleStatus.Missed)
            {
                progress.MissedSessions += 1;
            }
            else if (oldStatus == ScheduleStatus.Missed && newStatus != ScheduleStatus.Missed)
            {
                progress.MissedSessions = Math.Max(0, progress.MissedSessions - 1);
            }

            await _progressRepository.AddOrUpdateAsync(progress);
        }
    }

    public async Task<bool> DeleteScheduleAsync(int id)
    {
        return await _repository.DeleteScheduleAsync(id);
    }

    public async Task ClearSubjectSchedulesAsync(int userId, int subjectId)
    {
        var allSchedules = await _repository.GetByUserIdAsync(userId);
        var toDelete = allSchedules.Where(s => s.SubjectId == subjectId && s.AiGenerated).ToList();
        foreach (var s in toDelete)
        {
            await _repository.DeleteScheduleAsync(s.Id);
        }
    }

    public async Task<List<ScheduleResponseDto>> GenerateScheduleAsync(GenerateScheduleDto dto)
    {
        var subject = await _subjectRepository.GetSubjectByIdAsync(dto.SubjectId);
        if (subject == null) throw new Exception("Subject not found.");

        // Resolve nullable dates: Use Subject ExamDate for endDate if valid
        var startDate = dto.StartDate ?? DateTime.UtcNow.Date;
        var endDate = dto.EndDate ?? (subject.ExamDate > startDate ? subject.ExamDate : startDate.AddDays(30));

        // Resolve study preferences: Subject settings are primary, DTO values override if provided
        var maxHoursPerDay = dto.MaxHoursPerDay != 4 ? dto.MaxHoursPerDay : subject.HoursPerDay;
        var studyDaysPerWeek = subject.StudyDaysPerWeek;
        var preferredStartTime = dto.PreferredStartTime != "09:00" ? dto.PreferredStartTime : subject.PreferredStartTime;

        // Fallbacks for existing subjects that might have 0 in the database
        if (maxHoursPerDay <= 0) maxHoursPerDay = 2;
        if (studyDaysPerWeek <= 0) studyDaysPerWeek = 2;
        if (string.IsNullOrEmpty(preferredStartTime)) preferredStartTime = "09:00";

        // Build preferred days list from studyDaysPerWeek count (spread evenly across the week)
        var preferredDaysList = dto.PreferredDaysOfWeek;
        if (preferredDaysList.Count == 7 && studyDaysPerWeek < 7)
        {
            // Default DTO has all 7 days - override with subject's studyDaysPerWeek
            // Spread days evenly: e.g. 2 days/week → Mon, Thu; 3 days/week → Mon, Wed, Fri
            var spacing = 7.0 / studyDaysPerWeek;
            preferredDaysList = Enumerable.Range(0, studyDaysPerWeek)
                .Select(i => (int)Math.Round(i * spacing) % 7)
                .OrderBy(d => d)
                .ToList();
        }

        var chapters = await _chapterRepository.GetBySubjectIdAsync(dto.SubjectId);
        if (!chapters.Any()) throw new Exception("No chapters found. Please run AI syllabus analysis first.");

        var allExistingSchedules = await _repository.GetByUserIdAsync(dto.UserId);
        var busyBlocks = allExistingSchedules.Where(s => s.SubjectId == null).ToList();

        // Optionally clear existing AI-generated schedules for this subject
        if (dto.ClearExisting)
        {
            var toDelete = allExistingSchedules.Where(s => s.SubjectId == dto.SubjectId && s.AiGenerated).ToList();
            foreach (var s in toDelete)
                await _repository.DeleteScheduleAsync(s.Id);
        }

        var pendingChapters = chapters
            .Where(c => c.Status != ChapterStatus.Completed)
            .OrderBy(c => c.OrderIndex)
            .ToList();

        if (!pendingChapters.Any()) throw new Exception("All chapters are already completed.");

        // Calculate total lessons for even distribution guidance
        var totalLessons = pendingChapters.SelectMany(c => c.Lessons).Count();
        var daysUntilExam = (endDate - startDate).Days;
        var weeksUntilExam = Math.Max(1, (int)Math.Ceiling(daysUntilExam / 7.0));
        var lessonsPerWeek = totalLessons > 0 ? Math.Max(1, (int)Math.Ceiling((double)totalLessons / weeksUntilExam)) : 2;

        var chaptersJson = JsonSerializer.Serialize(pendingChapters.Select(c => new {
            chapterId = c.Id,
            chapterName = c.Title,
            difficulty = c.Difficulty,
            estimatedHours = c.EstimatedHours,
            lessons = c.Lessons.Select(l => new {
                lessonName = l.Title,
                durationMinutes = l.DurationMinutes,
                difficulty = l.Difficulty,
                learningObjectives = l.LearningObjectives
            })
        }), new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        var busySlotsStr = string.Join("\n", busyBlocks.Select(b => $"{b.Date:yyyy-MM-dd} {b.StartTime:hh\\:mm} - {b.EndTime:hh\\:mm}: {b.Title}"));
        var preferredDays = string.Join(", ", preferredDaysList.Select(d => ((DayOfWeek)d).ToString()));

        var examDateStr = subject.ExamDate > startDate ? subject.ExamDate.ToString("yyyy-MM-dd") : "Not specified";

        var user = await _userRepository.GetByIdAsync(dto.UserId);
        var availabilities = await _userAvailabilityRepository.GetByUserIdAsync(dto.UserId);
        
        var freeSlots = availabilities.Where(a => a.Type == AvailabilityType.Free).ToList();
        var fixedBusySlots = availabilities.Where(a => a.Type == AvailabilityType.Busy).ToList();
        
        var freeSlotsStr = freeSlots.Any() ? string.Join("\n", freeSlots.Select(a => $"{a.DayOfWeek}: {a.StartTime:hh\\:mm} - {a.EndTime:hh\\:mm}")) : "None defined";
        var fixedBusySlotsStr = fixedBusySlots.Any() ? string.Join("\n", fixedBusySlots.Select(a => $"{a.DayOfWeek}: {a.StartTime:hh\\:mm} - {a.EndTime:hh\\:mm} ({a.Label})")) : "None defined";
        
        var maxSessionMinutes = 120;
        var daysOff = new List<int>();
        if (!string.IsNullOrEmpty(user?.Preferences))
        {
            var prefs = JsonDocument.Parse(user.Preferences).RootElement;
            if (prefs.TryGetProperty("maxSessionMinutes", out var maxSessProp) && maxSessProp.ValueKind == JsonValueKind.Number)
                maxSessionMinutes = maxSessProp.GetInt32();
            if (prefs.TryGetProperty("daysOff", out var daysOffProp) && daysOffProp.ValueKind == JsonValueKind.Array)
                daysOff = daysOffProp.EnumerateArray().Select(e => e.GetInt32()).ToList();
        }
        var daysOffStr = daysOff.Any() ? string.Join(", ", daysOff.Select(d => ((DayOfWeek)d).ToString())) : "None";

        var prompt = $@"
# Smart Study Schedule Generation Prompt
You are an expert educational planning AI.
You MUST generate a comprehensive study schedule that maps EVERY SINGLE LESSON provided in the input JSON to a specific date and time slot.
Do NOT summarize or skip any lessons. Every lesson in the pending chapters MUST be assigned to at least one study session.

## Input

### Subject Information
* Subject Name: {subject.Title}
* Exam Date: {examDateStr}
* Subject Difficulty: {subject.Difficulty}

### Chapters & Lessons (YOU MUST MAP ALL OF THESE)
{chaptersJson}

### Distribution Target
* Total Lessons: {totalLessons}
* Weeks Until Exam: {weeksUntilExam}
* Target Lessons Per Week: ~{lessonsPerWeek} (distribute EVENLY — each week should have approximately the same number of lessons)

### Student Preferences
* Available Study Period: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}
* Preferred Study Time (Start): {preferredStartTime}
* Study Days Per Week: {studyDaysPerWeek} (STRICT - do NOT schedule more than {studyDaysPerWeek} study days per week)
* Maximum Study Hours Per Day: {maxHoursPerDay} (STRICT - each day's total study time must NOT exceed {maxHoursPerDay} hours)
* Max Session Duration: {maxSessionMinutes} minutes
* Preferred Study Days: {preferredDays}
* Days Off: {daysOffStr} (DO NOT schedule anything on these days)
* User Free Time Slots:
{freeSlotsStr}
* User Fixed Schedules (Busy):
{fixedBusySlotsStr}

### One-off Busy Time Slots
{busySlotsStr}

# Scheduling Rules
## Rule 1 - Completeness (CRITICAL)
You MUST generate a schedule block for EVERY lesson provided in the Chapters JSON. All {totalLessons} lessons must be covered.

## Rule 2 - EVEN Distribution Across Weeks (CRITICAL)
You MUST distribute lessons EVENLY across the available weeks. Each week should contain approximately {lessonsPerWeek} lesson(s).
Do NOT front-load — do NOT cluster all lessons at the beginning.
Do NOT back-load — do NOT cluster all lessons at the end.
Spread them UNIFORMLY from week 1 to the last week before exam.

## Rule 3 - Exam Day
If the Exam Date is specified ({examDateStr}), you MUST include an ""📝 EXAM DAY: {subject.Title}"" entry on that exact date.
This exam entry should have chapterId set to null, duration of 120, and a description mentioning the final exam.
All study lessons MUST be completed BEFORE the exam date. Reserve the last 2-3 days before the exam for Final Review only.

## Rule 4 - Respect Availability & Limits
Only schedule lessons on the Preferred Study Days and DO NOT overlap with Busy Time Slots.
Strictly adhere to the maximum study hours per day ({maxHoursPerDay}) and maximum study days per week ({studyDaysPerWeek}).

## Rule 5 - Spaced Repetition & Reviews
Include Review Sessions (Chapter Review, Mid-term Review, Final Exam Review). Mix difficulty levels to prevent burnout.

# Schedule Output Format
IMPORTANT: You MUST return valid JSON. Do not include markdown code block wrappers (like ```json). Just the raw JSON.
If a session is a review session not tied to a specific chapter, set chapterId to null or omit it.
The JSON must have this exact structure (with week1, week2, etc. containing the scheduled sessions):

{{
""week1"": [
{{
""date"": ""2026-06-01"",
""startTime"": ""19:00"",
""endTime"": ""20:00"",
""subject"": ""{subject.Title}"",
""chapterId"": 1,
""title"": ""Lesson Title or Review Name"",
""description"": ""Brief description of what to study"",
""duration"": 60
}}
],
""week2"": [],
""examReadinessScore"": 85,
""riskLevel"": ""Low"",
""expectedCompletionDate"": ""2026-06-24"",
""totalStudyHours"": 42,
""bufferHours"": 8,
""recommendations"": [
""Focus on Database Design this week""
]
}}
";

        var requestBody = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonBody = JsonSerializer.Serialize(requestBody, jsonOptions);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_geminiApiKey}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to generate schedule from AI: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(jsonResponse);
        var generatedText = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrEmpty(generatedText)) throw new Exception("AI returned empty content.");
        generatedText = generatedText.Trim();
        if (generatedText.StartsWith("```json"))
        {
            generatedText = generatedText.Substring(7);
            if (generatedText.EndsWith("```")) generatedText = generatedText.Substring(0, generatedText.Length - 3);
        }

        using var aiJson = JsonDocument.Parse(generatedText);
        var schedulesToCreate = new List<Schedule>();

        foreach (var prop in aiJson.RootElement.EnumerateObject())
        {
            if (prop.Name.StartsWith("week", StringComparison.OrdinalIgnoreCase) && prop.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in prop.Value.EnumerateArray())
                {
                    int? chapterId = null;
                    if (item.TryGetProperty("chapterId", out var cIdProp) && cIdProp.ValueKind == JsonValueKind.Number)
                    {
                        chapterId = cIdProp.GetInt32();
                    }

                    var dateStr = item.GetProperty("date").GetString()!;
                    var startTimeStr = item.GetProperty("startTime").GetString()!;
                    var endTimeStr = item.GetProperty("endTime").GetString()!;
                    var title = item.GetProperty("title").GetString() ?? "Study Session";
                    
                    string description = "";
                    if (item.TryGetProperty("description", out var descProp) && descProp.ValueKind == JsonValueKind.String)
                    {
                        description = descProp.GetString() ?? "";
                    }

                    var duration = item.GetProperty("duration").GetInt32();

                    var date = DateTime.Parse(dateStr);
                    var startTime = TimeSpan.Parse(startTimeStr);
                    var endTime = TimeSpan.Parse(endTimeStr);

                    schedulesToCreate.Add(new Schedule
                    {
                        UserId = dto.UserId,
                        SubjectId = dto.SubjectId,
                        ChapterId = chapterId,
                        Title = title,
                        Description = description,
                        Date = DateTime.SpecifyKind(date, DateTimeKind.Utc),
                        StartTime = startTime,
                        EndTime = endTime,
                        Duration = duration,
                        Priority = 3,
                        Status = ScheduleStatus.Pending,
                        AiGenerated = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        if (schedulesToCreate.Any())
            await _repository.AddSchedulesAsync(schedulesToCreate);

        var result = await _repository.GetByDateRangeAsync(dto.UserId, startDate, endDate.AddDays(1));
        return result.Select(MapToResponse).ToList();
    }

    public async Task<string> GenerateStudyContentAsync(int scheduleId)
    {
        var schedule = await _repository.GetByIdAsync(scheduleId);
        if (schedule == null) throw new Exception("Schedule not found.");

        if (!string.IsNullOrWhiteSpace(schedule.StudyContent))
        {
            return schedule.StudyContent; // Already generated
        }

        var subjectTitle = schedule.Subject?.Title ?? "Unknown Subject";
        var chapterTitle = schedule.Chapter?.Title ?? "Unknown Chapter";
        var description = schedule.Description ?? "";
        
        var lessonsInfo = "";
        if (schedule.Chapter != null && schedule.Chapter.Lessons.Any())
        {
            lessonsInfo = "\n\nLessons in this chapter:\n" + string.Join("\n", schedule.Chapter.Lessons.Select(l => 
                $"- {l.Title}: {l.Description} (Objectives: {l.LearningObjectives})"));
        }

        var prompt = $@"You are an expert tutor and study assistant.
Generate comprehensive study notes for a study session.

Subject: {subjectTitle}
Chapter: {chapterTitle}
Session Title: {schedule.Title}
Description: {description}
{lessonsInfo}

Please provide detailed, educational, and engaging content for the student to read and learn during this session.
Format the content in beautiful Markdown. Use headings, bullet points, bold text, code blocks (if applicable), and clear explanations.
Do not wrap the entire response in a single markdown code block; just return the markdown directly. Focus on the core concepts that the student needs to master.";

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                responseMimeType = "text/plain"
            }
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonBody = JsonSerializer.Serialize(requestBody, jsonOptions);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_geminiApiKey}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to generate study content: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(jsonResponse);

        var generatedText = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrEmpty(generatedText))
        {
            throw new Exception("AI returned empty content.");
        }

        // Clean up potential code block wrapping from the AI
        generatedText = generatedText.Trim();
        if (generatedText.StartsWith("```markdown"))
        {
            generatedText = generatedText.Substring(11);
            if (generatedText.EndsWith("```"))
                generatedText = generatedText.Substring(0, generatedText.Length - 3);
        }

        schedule.StudyContent = generatedText.Trim();
        schedule.UpdatedAt = DateTime.UtcNow;
        
        await _repository.UpdateScheduleAsync(schedule);

        return schedule.StudyContent;
    }

    public async Task<List<ParsedScheduleDto>> AnalyzeScreenshotAsync(string base64Image)
    {
        var prompt = @"Extract the study schedule from this image.
Return a JSON array of objects.
Each object must have exactly:
- day (string, e.g. ""Monday"")
- start (string, HH:mm format, e.g. ""07:00"")
- end (string, HH:mm format, e.g. ""09:15"")
- title (string, e.g. ""Math Class"")
- description (string, optional)

Do not wrap in markdown, return raw JSON.";

        // Basic mime type detection from base64 (assuming standard prefixes if present, or just jpeg)
        var mimeType = "image/jpeg";
        if (base64Image.StartsWith("data:image/png;base64,")) {
            mimeType = "image/png";
            base64Image = base64Image.Substring("data:image/png;base64,".Length);
        } else if (base64Image.StartsWith("data:image/jpeg;base64,")) {
            mimeType = "image/jpeg";
            base64Image = base64Image.Substring("data:image/jpeg;base64,".Length);
        } else if (base64Image.StartsWith("data:image/")) {
            var commaIndex = base64Image.IndexOf(',');
            if (commaIndex != -1) {
                var prefix = base64Image.Substring(0, commaIndex);
                mimeType = prefix.Replace("data:", "").Replace(";base64", "");
                base64Image = base64Image.Substring(commaIndex + 1);
            }
        }

        var requestBody = new
        {
            contents = new[]
            {
                new {
                    parts = new object[]
                    {
                        new { text = prompt },
                        new {
                            inlineData = new {
                                mimeType = mimeType,
                                data = base64Image
                            }
                        }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json"
            }
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonBody = JsonSerializer.Serialize(requestBody, jsonOptions);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_geminiApiKey}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to analyze screenshot: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(jsonResponse);

        var generatedText = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrEmpty(generatedText))
        {
            throw new Exception("AI returned empty content.");
        }

        generatedText = generatedText.Trim();
        if (generatedText.StartsWith("```json"))
        {
            generatedText = generatedText.Substring(7);
            if (generatedText.EndsWith("```"))
                generatedText = generatedText.Substring(0, generatedText.Length - 3);
        }

        var parsed = JsonSerializer.Deserialize<List<ParsedScheduleDto>>(generatedText, jsonOptions);
        return parsed ?? new List<ParsedScheduleDto>();
    }

    public async Task<FeasibilityResponseDto> AnalyzeFeasibilityAsync(FeasibilityRequestDto dto)
    {
        var subject = await _subjectRepository.GetSubjectByIdAsync(dto.SubjectId);
        if (subject == null) throw new Exception("Subject not found.");

        var chapters = await _chapterRepository.GetBySubjectIdAsync(dto.SubjectId);
        var totalLessons = chapters.SelectMany(c => c.Lessons).Count();
        var totalStudyHours = chapters.Sum(c => c.EstimatedHours);

        var currentDate = dto.CurrentDate ?? DateTime.UtcNow.Date;
        var examDateStr = subject.ExamDate > currentDate ? subject.ExamDate.ToString("yyyy-MM-dd") : "Not specified";

        var user = await _userRepository.GetByIdAsync(dto.UserId);
        var availabilities = await _userAvailabilityRepository.GetByUserIdAsync(dto.UserId);
        var freeSlots = availabilities.Where(a => a.Type == AvailabilityType.Free).ToList();
        var freeSlotsStr = freeSlots.Any() ? string.Join("\n", freeSlots.Select(a => $"{a.DayOfWeek}: {a.StartTime:hh\\:mm} - {a.EndTime:hh\\:mm}")) : "None defined";

        var daysOff = new List<int>();
        if (!string.IsNullOrEmpty(user?.Preferences))
        {
            var prefs = JsonDocument.Parse(user.Preferences).RootElement;
            if (prefs.TryGetProperty("daysOff", out var daysOffProp) && daysOffProp.ValueKind == JsonValueKind.Array)
                daysOff = daysOffProp.EnumerateArray().Select(e => e.GetInt32()).ToList();
        }
        var daysOffStr = daysOff.Any() ? string.Join(", ", daysOff.Select(d => ((DayOfWeek)d).ToString())) : "None";

        var prompt = $@"
# Study Feasibility Analysis Prompt
You are an intelligent educational planning assistant.
Your task is NOT to generate a study schedule yet.
Your task is to analyze whether the student has enough time to complete the subject before the exam.

## Input

### Subject Information
* Subject Name: {subject.Title}
* Exam Date: {examDateStr}

### Learning Structure
* Total Chapters: {chapters.Count}
* Total Lessons: {totalLessons}
* Total Estimated Study Hours: {totalStudyHours}

### Student Study Preferences
* Free Time Slots: 
{freeSlotsStr}
* Days Off: {daysOffStr}
* Sessions Per Week: {(subject.StudyDaysPerWeek > 0 ? subject.StudyDaysPerWeek : 2)}
* Hours Per Session: {(subject.HoursPerDay > 0 ? subject.HoursPerDay : 2)}
* Preferred Study Time: {subject.PreferredStartTime}
* Current Date: {currentDate:yyyy-MM-dd}

## Objectives
Analyze the feasibility of completing the subject before the exam.
Calculate:
1. Remaining days until exam
2. Remaining weeks until exam
3. Total available study hours before exam
4. Required study hours
5. Required sessions
6. Required study hours per week
7. Required study hours per session
8. Completion probability
9. Risk level

Do NOT generate a calendar.
Only generate a study feasibility report.

## Risk Levels
Low Risk: Coverage >= 100%
Moderate Risk: Coverage 80% - 99%
High Risk: Coverage 50% - 79%
Very High Risk: Coverage < 50%

## Output Format
IMPORTANT: You MUST return valid JSON. Do not include markdown code block wrappers (like ```json). Just the raw JSON.
{{
""subjectName"": ""{subject.Title}"",
""totalLessons"": {totalLessons},
""totalStudyHours"": {totalStudyHours},
""examDate"": ""{examDateStr}"",
""weeksRemaining"": 4,
""availableStudyHours"": 24,
""requiredStudyHours"": {totalStudyHours},
""coveragePercent"": 41,
""requiredHoursPerWeek"": 14.5,
""recommendedSessionsPerWeek"": 6,
""riskLevel"": ""Very High"",
""completionProbability"": 35,
""recommendations"": [
""Increase study sessions to 6 per week""
]
}}
";

        var requestBody = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonBody = JsonSerializer.Serialize(requestBody, jsonOptions);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_geminiApiKey}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to analyze feasibility: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(jsonResponse);

        var generatedText = document.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrEmpty(generatedText)) throw new Exception("AI returned empty content.");
        generatedText = generatedText.Trim();
        if (generatedText.StartsWith("```json"))
        {
            generatedText = generatedText.Substring(7);
            if (generatedText.EndsWith("```")) generatedText = generatedText.Substring(0, generatedText.Length - 3);
        }

        var parsed = JsonSerializer.Deserialize<FeasibilityResponseDto>(generatedText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return parsed ?? throw new Exception("Failed to parse feasibility analysis.");
    }

    private static ScheduleResponseDto MapToResponse(Schedule schedule)
    {
        return new ScheduleResponseDto
        {
            Id = schedule.Id,
            UserId = schedule.UserId,
            SubjectId = schedule.SubjectId,
            ChapterId = schedule.ChapterId,
            Title = schedule.Title,
            Description = schedule.Description,
            StudyContent = schedule.StudyContent,
            Date = schedule.Date.ToString("yyyy-MM-dd"),
            StartTime = schedule.StartTime.ToString(@"hh\:mm"),
            EndTime = schedule.EndTime.ToString(@"hh\:mm"),
            Duration = schedule.Duration,
            Priority = schedule.Priority,
            Status = schedule.Status.ToString().ToLower(),
            AiGenerated = schedule.AiGenerated,
            SubjectTitle = schedule.Subject?.Title,
            SubjectColor = schedule.Subject?.Color,
            ChapterTitle = schedule.Chapter?.Title
        };
    }
}
