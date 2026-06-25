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
