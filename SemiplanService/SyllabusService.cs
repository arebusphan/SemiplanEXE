namespace SemiplanService;
using SemiplanData;
using SemiplanRepository;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;

public class SyllabusService
{
    private readonly ChapterRepository _chapterRepository;
    private readonly SubjectRepository _subjectRepository;
    private readonly HttpClient _httpClient;
    private readonly string _geminiApiKey;

    public SyllabusService(
        ChapterRepository chapterRepository,
        SubjectRepository subjectRepository,
        IConfiguration configuration)
    {
        _chapterRepository = chapterRepository;
        _subjectRepository = subjectRepository;
        _httpClient = new HttpClient();
        _geminiApiKey = configuration["Gemini:ApiKey"] ?? "";
    }

    public async Task<List<ChapterResponseDto>> AnalyzeSyllabusAsync(int subjectId, SyllabusAnalyzeDto? dto = null)
    {
        dto ??= new SyllabusAnalyzeDto();

        var subject = await _subjectRepository.GetSubjectByIdAsync(subjectId);
        if (subject == null) throw new Exception("Subject not found");

        // Clear existing chapters for re-analysis
        var existingChapters = await _chapterRepository.GetBySubjectIdAsync(subjectId);
        if (existingChapters.Any())
        {
            foreach (var ch in existingChapters)
                await _chapterRepository.DeleteChapterAsync(ch.Id);
        }

        var totalHours = subject.EstimatedStudyHours > 0 ? subject.EstimatedStudyHours : 20;

        // ── Build context lines from optional DTO fields ──────────────────
        var contextParts = new List<string>();

        if (dto.SemesterStart.HasValue && dto.SemesterEnd.HasValue)
        {
            var days = (dto.SemesterEnd.Value - dto.SemesterStart.Value).Days;
            contextParts.Add($"The semester runs from {dto.SemesterStart.Value:yyyy-MM-dd} to {dto.SemesterEnd.Value:yyyy-MM-dd} ({days} days total).");
        }
        else if (dto.SemesterEnd.HasValue)
        {
            contextParts.Add($"The final exam / last class date is {dto.SemesterEnd.Value:yyyy-MM-dd}.");
        }

        if (dto.StudyDaysPerWeek.HasValue)
            contextParts.Add($"The student can study {dto.StudyDaysPerWeek} day(s) per week.");

        if (dto.HoursPerDay.HasValue)
            contextParts.Add($"The student has at most {dto.HoursPerDay} hour(s) available per study day.");

        if (dto.IncludeReview)
            contextParts.Add("Include a short review session approximately 2 days after each chapter ends. Mark these chapters with a Title prefix 'Review: '.");

        if (!string.IsNullOrWhiteSpace(dto.ExtraNotes))
            contextParts.Add($"Additional instructions from the student: \"{dto.ExtraNotes.Trim()}\".");

        var contextBlock = contextParts.Count > 0
            ? "\n\nAdditional context:\n" + string.Join("\n", contextParts)
            : string.Empty;

        var syllabusContent = !string.IsNullOrWhiteSpace(dto.SyllabusText)
            ? $"\n\nThe student provided the following syllabus content:\n---\n{dto.SyllabusText.Trim()}\n---\nBase your chapter breakdown primarily on this content."
            : string.Empty;

        var language = string.IsNullOrWhiteSpace(dto.Language) ? "English" : dto.Language.Trim();
        var languageLine = language.Equals("English", StringComparison.OrdinalIgnoreCase)
            ? string.Empty
            : $"\n\nIMPORTANT: Return all Title, Description, and LearningObjectives text in {language}.";

        var prompt = $@"You are an expert academic study planner.

Analyze the syllabus for the subject '{subject.Title}'.
Subject description: '{subject.Description}'.
Total estimated study hours for the entire subject: {totalHours} hours.
{syllabusContent}{contextBlock}{languageLine}

Create a detailed, realistic learning structure appropriate for a university course.

Return a JSON array of chapters. For each chapter provide:
- Title        (string)
- Description  (string — 1–2 sentences explaining what the chapter covers)
- Difficulty   (integer 1–5, where 1 = very easy and 5 = very hard)
- EstimatedHours (integer — realistic hours needed to master this chapter)
- Lessons      (array of lesson objects)

For each lesson provide:
- Title              (string)
- Description        (string — one sentence)
- DurationMinutes    (integer between 30 and 120)
- Difficulty         (integer 1–5)
- LearningObjectives (array of 2–4 concise strings)

Ensure EstimatedHours values across all chapters sum to approximately {totalHours} hours total.
Respond ONLY with the raw JSON array — no markdown, no explanation, no code fences.";

        object requestBody;

        if (!string.IsNullOrEmpty(dto.Base64File) && !string.IsNullOrEmpty(dto.MimeType))
        {
            var base64Data = dto.Base64File;
            if (base64Data.Contains(","))
                base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);

            requestBody = new
            {
                contents = new[]
                {
                    new {
                        parts = new object[]
                        {
                            new { text = prompt },
                            new {
                                inlineData = new {
                                    mimeType = dto.MimeType,
                                    data = base64Data
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
        }
        else
        {
            requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json"
                }
            };
        }

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonBody = JsonSerializer.Serialize(requestBody, jsonOptions);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_geminiApiKey}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to call Gemini API: {response.StatusCode} - {errorContent}");
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
            throw new Exception("Gemini API returned an empty response.");
        }

        var elemList = JsonSerializer.Deserialize<List<JsonElement>>(generatedText);
        if (elemList == null || !elemList.Any())
            throw new Exception("Failed to parse Gemini API response into chapters.");

        var generatedChapters = new List<Chapter>();
        int orderIndex = 1;
        foreach (var elem in elemList)
        {
            string title = elem.TryGetProperty("Title", out var t) ? (t.GetString() ?? $"Chapter {orderIndex}") : $"Chapter {orderIndex}";
            string desc = elem.TryGetProperty("Description", out var d) ? (d.GetString() ?? "No description.") : "No description.";

            int difficulty = 3;
            if (elem.TryGetProperty("Difficulty", out var diff) && diff.ValueKind == JsonValueKind.Number)
            {
                difficulty = (int)Math.Round(diff.GetDouble());
                if (difficulty < 1 || difficulty > 5) difficulty = 3;
            }

            int estimatedHours = 2;
            if (elem.TryGetProperty("EstimatedHours", out var eh))
            {
                if (eh.ValueKind == JsonValueKind.Number)
                    estimatedHours = Math.Max(1, (int)Math.Ceiling(eh.GetDouble()));
                else if (eh.ValueKind == JsonValueKind.String && int.TryParse(eh.GetString(), out var parsed))
                    estimatedHours = Math.Max(1, parsed);
            }

            var chapter = new Chapter
            {
                SubjectId = subjectId,
                Title = title,
                Description = desc,
                Difficulty = difficulty,
                EstimatedHours = estimatedHours,
                Priority = 6 - (orderIndex > 5 ? 5 : orderIndex),
                OrderIndex = orderIndex,
                Status = ChapterStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Lessons = new List<Lesson>()
            };

            if (elem.TryGetProperty("Lessons", out var lessonsElem) && lessonsElem.ValueKind == JsonValueKind.Array)
            {
                int lessonOrder = 1;
                foreach (var lElem in lessonsElem.EnumerateArray())
                {
                    string lTitle = lElem.TryGetProperty("Title", out var lt) ? (lt.GetString() ?? $"Lesson {lessonOrder}") : $"Lesson {lessonOrder}";
                    string lDesc = lElem.TryGetProperty("Description", out var ld) ? (ld.GetString() ?? "") : "";

                    int lDur = 60;
                    if (lElem.TryGetProperty("DurationMinutes", out var ldm) && ldm.ValueKind == JsonValueKind.Number)
                        lDur = (int)ldm.GetDouble();

                    int lDiff = 3;
                    if (lElem.TryGetProperty("Difficulty", out var ldf) && ldf.ValueKind == JsonValueKind.Number)
                        lDiff = (int)ldf.GetDouble();

                    var lObjs = new List<string>();
                    if (lElem.TryGetProperty("LearningObjectives", out var loElem) && loElem.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var objElem in loElem.EnumerateArray())
                        {
                            if (objElem.ValueKind == JsonValueKind.String)
                            {
                                lObjs.Add(objElem.GetString() ?? "");
                            }
                        }
                    }

                    chapter.Lessons.Add(new Lesson
                    {
                        Title = lTitle,
                        Description = lDesc,
                        DurationMinutes = lDur,
                        Difficulty = lDiff,
                        LearningObjectives = JsonSerializer.Serialize(lObjs),
                        OrderIndex = lessonOrder
                    });
                    lessonOrder++;
                }
            }

            generatedChapters.Add(chapter);
            orderIndex++;
        }

        await _chapterRepository.AddChaptersAsync(generatedChapters);

        return generatedChapters.Select(c => new ChapterResponseDto
        {
            Id = c.Id,
            SubjectId = c.SubjectId,
            Title = c.Title,
            Description = c.Description,
            Difficulty = c.Difficulty,
            EstimatedHours = c.EstimatedHours,
            Priority = c.Priority,
            OrderIndex = c.OrderIndex,
            CompletionPercent = c.CompletionPercent,
            Status = c.Status.ToString().ToLower(),
            Lessons = c.Lessons.Select(l => new LessonResponseDto
            {
                Id = l.Id,
                Title = l.Title,
                Description = l.Description,
                DurationMinutes = l.DurationMinutes,
                Difficulty = l.Difficulty,
                OrderIndex = l.OrderIndex,
                LearningObjectives = string.IsNullOrEmpty(l.LearningObjectives)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(l.LearningObjectives) ?? new List<string>()
            }).ToList()
        }).ToList();
    }
}
