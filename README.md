# 📚 SemiPlan

> AI-powered smart study planner for students.

SemiPlan is an intelligent study planning platform that helps students automatically generate study schedules using AI. The system analyzes syllabus files or subject descriptions, evaluates difficulty, estimates study time, and creates personalized learning schedules based on student free time, deadlines, and progress.

---

# ✨ Main Features

## 🧠 AI Syllabus Analysis

* Upload syllabus files (`PDF`, `DOCX`, `TXT`)
* Extract chapters/topics automatically
* Estimate difficulty and study hours
* Generate learning roadmap

---

## 📅 Smart Study Scheduling

* Auto-generate study schedules
* Prioritize difficult subjects
* Optimize schedules based on free time
* Weekly calendar view (Monday → Sunday)

---

## 🔄 Dynamic Rescheduling

* Detect missed study sessions
* Automatically move unfinished tasks
* Recalculate priorities
* Avoid overloaded schedules

---

## ⚠️ Smart Warning System

* Warn students when they are behind schedule
* Predict risk of failing to finish before exams
* Recommend recovery plans

---

## 📘 AI Lesson Summary

For each study session:

* AI-generated summaries
* Important concepts
* Learning objectives
* Practice suggestions

---

## 📊 Progress Tracking

* Subject completion percentage
* Study hours tracking
* Learning streaks
* Productivity analytics

---

## 📝 Assignment & Project Management

* Track assignments/projects
* Monitor deadlines
* Manage milestones

---

# 🏗️ Tech Stack

## Frontend

* ReactJS
* TailwindCSS
* shadcn/ui
* Axios

---

## Backend

* NodeJS
* ExpressJS
* JWT Authentication

---

## Database

* PostgreSQL
* Prisma ORM

---

## AI

* OpenAI API
* NLP Processing

---

# 📂 Project Structure

```bash
semiplan/
│
├── frontend/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── prisma/
│   └── utils/
│
├── database/
│
└── README.md
```

---

# 🧠 System Workflow

```txt
Add Subject
      ↓
Upload Syllabus
      ↓
Extract Text
      ↓
AI Analyze Chapters
      ↓
Estimate Difficulty
      ↓
Generate Study Schedule
      ↓
Track Progress
      ↓
Reschedule if Needed
```

---

# 🌐 Main APIs

# 🔐 Authentication APIs

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

---

# 📘 Subject APIs

```http
POST   /api/subjects
GET    /api/subjects
GET    /api/subjects/:id
DELETE /api/subjects/:id
```

---

# 📄 Syllabus APIs

```http
POST /api/syllabus/upload
```

---

# 📚 Chapter APIs

```http
GET /api/chapters/:subjectId
```

---

# 📅 Schedule APIs

```http
POST /api/schedules/generate
GET  /api/schedules
PUT  /api/schedules/:id/status
```

---

# 📊 Progress APIs

```http
GET /api/progress/dashboard
PUT /api/progress/update
```

---

# 📝 Assignment APIs

```http
POST /api/assignments
GET  /api/assignments
```

---

# 🔔 Notification APIs

```http
GET /api/notifications
```

---

# 📘 Summary APIs

```http
GET /api/summaries/:scheduleId
```

---

# 🧩 Entities & Attributes

# 👤 User

| Attribute  | Type     | Description   |
| ---------- | -------- | ------------- |
| id         | UUID     | User ID       |
| fullName   | String   | Full name     |
| email      | String   | Email         |
| password   | String   | Password hash |
| avatar     | String   | Avatar        |
| major      | String   | Major         |
| university | String   | University    |
| timezone   | String   | Timezone      |
| createdAt  | DateTime | Created time  |
| updatedAt  | DateTime | Updated time  |

---

# 📘 Subject

| Attribute      | Type     | Description       |
| -------------- | -------- | ----------------- |
| id             | UUID     | Subject ID        |
| userId         | UUID     | Owner             |
| title          | String   | Subject title     |
| description    | Text     | Description       |
| difficulty     | Integer  | Difficulty level  |
| color          | String   | UI color          |
| examDate       | Date     | Exam date         |
| estimatedHours | Integer  | Total study hours |
| status         | Enum     | active/completed  |
| createdAt      | DateTime | Created time      |
| updatedAt      | DateTime | Updated time      |

---

# 📄 Syllabus

| Attribute     | Type     | Description       |
| ------------- | -------- | ----------------- |
| id            | UUID     | Syllabus ID       |
| subjectId     | UUID     | Related subject   |
| fileName      | String   | File name         |
| fileUrl       | String   | File URL          |
| fileType      | String   | pdf/docx          |
| extractedText | Text     | Extracted content |
| uploadedAt    | DateTime | Upload time       |

---

# 📚 Chapter

| Attribute         | Type     | Description       |
| ----------------- | -------- | ----------------- |
| id                | UUID     | Chapter ID        |
| subjectId         | UUID     | Subject           |
| title             | String   | Chapter title     |
| description       | Text     | Description       |
| difficulty        | Integer  | Difficulty        |
| estimatedHours    | Integer  | Estimated hours   |
| priority          | Integer  | Priority          |
| orderIndex        | Integer  | Order             |
| completionPercent | Float    | Completion %      |
| status            | Enum     | pending/completed |
| createdAt         | DateTime | Created time      |

---

# 📅 Schedule

| Attribute   | Type     | Description              |
| ----------- | -------- | ------------------------ |
| id          | UUID     | Schedule ID              |
| userId      | UUID     | User                     |
| subjectId   | UUID     | Subject                  |
| chapterId   | UUID     | Chapter                  |
| title       | String   | Session title            |
| description | Text     | Session content          |
| date        | Date     | Study date               |
| startTime   | Time     | Start time               |
| endTime     | Time     | End time                 |
| duration    | Integer  | Duration                 |
| priority    | Integer  | Priority                 |
| status      | Enum     | pending/completed/missed |
| aiGenerated | Boolean  | AI generated             |
| createdAt   | DateTime | Created time             |
| updatedAt   | DateTime | Updated time             |

---

# 📊 Progress

| Attribute         | Type     | Description        |
| ----------------- | -------- | ------------------ |
| id                | UUID     | Progress ID        |
| userId            | UUID     | User               |
| subjectId         | UUID     | Subject            |
| completionPercent | Float    | Completion %       |
| totalStudyHours   | Integer  | Study hours        |
| completedSessions | Integer  | Completed sessions |
| missedSessions    | Integer  | Missed sessions    |
| streakDays        | Integer  | Learning streak    |
| lastStudiedAt     | DateTime | Last studied       |
| updatedAt         | DateTime | Updated time       |

---

# 📝 Assignment

| Attribute      | Type     | Description              |
| -------------- | -------- | ------------------------ |
| id             | UUID     | Assignment ID            |
| userId         | UUID     | User                     |
| subjectId      | UUID     | Subject                  |
| title          | String   | Assignment title         |
| description    | Text     | Description              |
| deadline       | DateTime | Deadline                 |
| estimatedHours | Integer  | Estimated hours          |
| progress       | Float    | Progress %               |
| priority       | Integer  | Priority                 |
| status         | Enum     | pending/in-progress/done |
| createdAt      | DateTime | Created time             |
| updatedAt      | DateTime | Updated time             |

---

# 🔔 Notification

| Attribute | Type     | Description             |
| --------- | -------- | ----------------------- |
| id        | UUID     | Notification ID         |
| userId    | UUID     | User                    |
| title     | String   | Title                   |
| message   | Text     | Message                 |
| type      | Enum     | reminder/warning/system |
| isRead    | Boolean  | Read status             |
| createdAt | DateTime | Created time            |

---

# 🧠 AIRecommendation

| Attribute | Type     | Description        |
| --------- | -------- | ------------------ |
| id        | UUID     | Recommendation ID  |
| userId    | UUID     | User               |
| subjectId | UUID     | Subject            |
| type      | String   | warning/suggestion |
| message   | Text     | Recommendation     |
| priority  | Integer  | Priority           |
| createdAt | DateTime | Created time       |

---

# 📘 LessonSummary

| Attribute           | Type     | Description          |
| ------------------- | -------- | -------------------- |
| id                  | UUID     | Summary ID           |
| scheduleId          | UUID     | Related schedule     |
| summary             | Text     | AI summary           |
| importantConcepts   | JSON     | Key concepts         |
| practiceSuggestions | JSON     | Practice suggestions |
| createdAt           | DateTime | Created time         |

---

# ⏰ StudyPreference

| Attribute     | Type     | Description     |
| ------------- | -------- | --------------- |
| id            | UUID     | Preference ID   |
| userId        | UUID     | User            |
| weekday       | Integer  | 1-7             |
| startTime     | Time     | Start time      |
| endTime       | Time     | End time        |
| maxStudyHours | Integer  | Max study hours |
| createdAt     | DateTime | Created time    |

---

# 📈 StudySessionLog

| Attribute   | Type     | Description  |
| ----------- | -------- | ------------ |
| id          | UUID     | Log ID       |
| userId      | UUID     | User         |
| scheduleId  | UUID     | Schedule     |
| actualStart | DateTime | Actual start |
| actualEnd   | DateTime | Actual end   |
| duration    | Integer  | Duration     |
| completed   | Boolean  | Completed    |
| createdAt   | DateTime | Created time |

---

# 🔥 Entity Relationships

```txt
User
 ├── Subjects
 │     ├── Syllabus
 │     ├── Chapters
 │     ├── Assignments
 │     ├── Schedules
 │     └── Progress
 │
 ├── Notifications
 ├── StudyPreferences
 ├── StudySessionLogs
 └── AIRecommendations

Schedule
 └── LessonSummary
```

---

# 📅 Scheduling Logic

The scheduling algorithm:

* prioritizes difficult subjects
* considers deadlines
* uses free-time slots
* avoids overload
* dynamically updates schedules

Example:

```txt
Monday → SQL
Tuesday → JOIN
Wednesday → Database Revision
```

---

# 🧠 AI Integration Flow

```txt
Frontend Upload File
        ↓
Backend Extract Text
        ↓
Send Text to OpenAI API
        ↓
AI Returns JSON Response
        ↓
Parse JSON
        ↓
Save Database
        ↓
Generate Schedule
        ↓
Return Data to Frontend
```

---

# 🎯 MVP Features

Minimum viable product should include:

✅ Authentication
✅ Subject CRUD
✅ Upload syllabus
✅ AI chapter analysis
✅ Weekly calendar
✅ Schedule generation
✅ Progress tracking

---

# 🚀 Future Features

* AI tutor chatbot
* Calendar sync
* Mobile application
* AI-generated quizzes
* Focus mode
* Gamification
* Real-time collaboration
* Smart reminders

---

# 🎯 Vision

SemiPlan aims to become a complete AI-powered academic assistant that helps students study smarter, stay organized, improve productivity, and reduce procrastination through intelligent scheduling and adaptive learning systems.
