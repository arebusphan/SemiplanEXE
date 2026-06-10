export interface User {
    id: number;
    name: string;
    email: string;
    major: string;
    university: string;
    role: string;
    isPremium: boolean;
}

export interface PremiumPayment {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    transactionInfo: string;
    amount: number;
    status: string;
    createdAt: string;
    approvedAt?: string;
}

export interface Subject {
    id: number;
    userId: number;
    title: string;
    description: string;
    difficulty: number;
    color: string;
    examDate: string;
    estimatedStudyHours: number;
    status: string;
    createdAt: string;
}

export interface Chapter {
    id: number;
    subjectId: number;
    title: string;
    description: string;
    difficulty: number;
    estimatedHours: number;
    priority: number;
    orderIndex: number;
    completionPercent: number;
    status: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    difficulty: number;
    learningObjectives: string[];
    orderIndex: number;
}

export interface Schedule {
    id: number;
    userId: number;
    subjectId?: number;
    chapterId?: number;
    title: string;
    description: string;
    studyContent?: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    priority: number;
    status: string;
    aiGenerated: boolean;
    subjectTitle?: string;
    subjectColor?: string;
    chapterTitle?: string;
}

export interface Assignment {
    id: number;
    userId: number;
    subjectId: number;
    title: string;
    description: string;
    deadline: string;
    estimatedHours: number;
    progress: number;
    priority: number;
    status: string;
    subjectTitle?: string;
    subjectColor?: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface ProgressData {
    id: number;
    subjectId: number;
    subjectTitle: string;
    subjectColor: string;
    completionPercent: number;
    totalStudyHours: number;
    completedSessions: number;
    missedSessions: number;
    streakDays: number;
    lastStudiedAt?: string;
}

export interface Dashboard {
    totalSubjects: number;
    totalStudyHours: number;
    completedSessions: number;
    upcomingAssignments: number;
    overallProgress: number;
    currentStreak: number;
    subjectProgress: ProgressData[];
    upcomingSchedules: Schedule[];
    nearDeadlineAssignments: Assignment[];
}
