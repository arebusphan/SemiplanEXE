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

        // Resolve dates
        var startDate = dto.StartDate ?? DateTime.UtcNow.Date;
        var endDate = dto.EndDate ?? (subject.ExamDate > startDate ? subject.ExamDate : startDate.AddDays(30));

        // Resolve study preferences (subject settings take priority)
        var maxHoursPerDay = dto.MaxHoursPerDay != 4 ? dto.MaxHoursPerDay : subject.HoursPerDay;
        var studyDaysPerWeek = subject.StudyDaysPerWeek;
        var preferredStartTime = dto.PreferredStartTime != "09:00" ? dto.PreferredStartTime : subject.PreferredStartTime;

        if (maxHoursPerDay <= 0) maxHoursPerDay = 2;
        if (studyDaysPerWeek <= 0) studyDaysPerWeek = 2;
        if (string.IsNullOrEmpty(preferredStartTime)) preferredStartTime = "09:00";

        // Build preferred days list
        var preferredDaysList = dto.PreferredDaysOfWeek;
        if (preferredDaysList.Count == 7 && studyDaysPerWeek < 7)
        {
            var spacing = 7.0 / studyDaysPerWeek;
            preferredDaysList = Enumerable.Range(0, studyDaysPerWeek)
                .Select(i => (int)Math.Round(i * spacing) % 7)
                .OrderBy(d => d)
                .ToList();
        }

        var chapters = await _chapterRepository.GetBySubjectIdAsync(dto.SubjectId);
        if (!chapters.Any()) throw new Exception("No chapters found. Please run AI syllabus analysis first.");

        var allExistingSchedules = await _repository.GetByUserIdAsync(dto.UserId);

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

        // Get user preferences
        var user = await _userRepository.GetByIdAsync(dto.UserId);
        var availabilities = await _userAvailabilityRepository.GetByUserIdAsync(dto.UserId);
        var fixedBusySlots = availabilities.Where(a => a.Type == AvailabilityType.Busy).ToList();

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

        // Flatten all lessons in chapter/lesson order
        var allLessons = pendingChapters
            .SelectMany(c => c.Lessons
                .OrderBy(l => l.OrderIndex)
                .Select(l => new { Chapter = c, Lesson = l }))
            .ToList();

        // Determine exam date and study period end
        var examDate = subject.ExamDate > startDate ? subject.ExamDate.Date : (DateTime?)null;
        var studyEndDate = examDate.HasValue ? examDate.Value.AddDays(-3) : endDate.Date;

        // Build list of valid study dates
        var studyDates = new List<DateTime>();
        var cur = startDate.Date;
        while (cur <= studyEndDate)
        {
            int dow = (int)cur.DayOfWeek;
            if (preferredDaysList.Contains(dow) && !daysOff.Contains(dow))
                studyDates.Add(cur);
            cur = cur.AddDays(1);
        }

        if (!studyDates.Any())
            throw new Exception("No available study dates found based on your preferences. Please check your settings.");

        // Distribute lessons evenly: calculate how many lessons per day
        var startTimeSpan = TimeSpan.TryParse(preferredStartTime, out var pts) ? pts : TimeSpan.FromHours(9);
        int lessonIdx = 0;
        var schedulesToCreate = new List<Schedule>();

        foreach (var date in studyDates)
        {
            if (lessonIdx >= allLessons.Count) break;

            // Busy slots for this day of week (sorted)
            var dayBusySlots = fixedBusySlots
                .Where(a => a.DayOfWeek == (int)date.DayOfWeek)
                .OrderBy(a => a.StartTime)
                .ToList();

            var currentTime = startTimeSpan;
            int minutesUsedToday = 0;
            int maxMinutesToday = maxHoursPerDay * 60;

            while (lessonIdx < allLessons.Count && minutesUsedToday < maxMinutesToday)
            {
                var item = allLessons[lessonIdx];
                var duration = item.Lesson.DurationMinutes > 0 ? item.Lesson.DurationMinutes : 60;
                duration = Math.Min(duration, maxSessionMinutes);

                if (minutesUsedToday + duration > maxMinutesToday) break;

                var sessionEnd = currentTime.Add(TimeSpan.FromMinutes(duration));

                // Skip past overlapping fixed busy slots
                var conflict = dayBusySlots.FirstOrDefault(b => currentTime < b.EndTime && sessionEnd > b.StartTime);
                if (conflict != null)
                {
                    currentTime = conflict.EndTime.Add(TimeSpan.FromMinutes(5));
                    sessionEnd = currentTime.Add(TimeSpan.FromMinutes(duration));
                    if (currentTime.TotalHours >= 22) break;
                    continue;
                }

                if (sessionEnd.TotalHours > 23) break;

                schedulesToCreate.Add(new Schedule
                {
                    UserId = dto.UserId,
                    SubjectId = dto.SubjectId,
                    ChapterId = item.Chapter.Id,
                    Title = item.Lesson.Title,
                    Description = item.Chapter.Title,
                    Date = DateTime.SpecifyKind(date, DateTimeKind.Utc),
                    StartTime = currentTime,
                    EndTime = sessionEnd,
                    Duration = duration,
                    Priority = 3,
                    Status = ScheduleStatus.Pending,
                    AiGenerated = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

                currentTime = sessionEnd.Add(TimeSpan.FromMinutes(15)); // 15-min break
                minutesUsedToday += duration + 15;
                lessonIdx++;
            }
        }

        // Add exam day entry
        if (examDate.HasValue)
        {
            schedulesToCreate.Add(new Schedule
            {
                UserId = dto.UserId,
                SubjectId = dto.SubjectId,
                ChapterId = null,
                Title = $"📝 EXAM: {subject.Title}",
                Description = "Final exam day. Review your notes and good luck!",
                Date = DateTime.SpecifyKind(examDate.Value, DateTimeKind.Utc),
                StartTime = TimeSpan.FromHours(7),
                EndTime = TimeSpan.FromHours(9),
                Duration = 120,
                Priority = 5,
                Status = ScheduleStatus.Pending,
                AiGenerated = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
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
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_geminiApiKey}",
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
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_geminiApiKey}",
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
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_geminiApiKey}",
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
