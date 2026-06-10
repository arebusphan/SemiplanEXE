import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5259/api",
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("semiplan_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Auth ────────────────────────────────────────
export const register = async (data: {
    name: string;
    email: string;
    password: string;
    major: string;
    university: string;
}) => {
    const res = await API.post("/auth/register", data);
    return res.data;
};

export const login = async (data: { email: string; password: string }) => {
    const res = await API.post("/auth/login", data);
    return res.data;
};

export const getMe = async () => {
    const res = await API.get("/auth/me");
    return res.data;
};

export const updatePreferences = async (preferences: string) => {
    const res = await API.put("/auth/preferences", { preferences });
    return res.data;
};

// ─── User Availability ───────────────────────────
export const getUserAvailabilities = async () => {
    const res = await API.get("/UserAvailability");
    return res.data;
};

export const updateUserAvailabilities = async (availabilities: any[]) => {
    const res = await API.put("/UserAvailability", { availabilities });
    return res.data;
};

// ─── Subjects ────────────────────────────────────
export const getSubjects = async () => {
    const res = await API.get("/subjects");
    return res.data;
};

export const getSubjectById = async (id: number) => {
    const res = await API.get(`/subjects/${id}`);
    return res.data;
};

export const createSubject = async (data: any) => {
    const res = await API.post("/subjects", data);
    return res.data;
};

export const updateSubject = async (id: number, data: any) => {
    const res = await API.put(`/subjects/${id}`, data);
    return res.data;
};

export const deleteSubject = async (id: number) => {
    const res = await API.delete(`/subjects/${id}`);
    return res.data;
};

// ─── Chapters ────────────────────────────────────
export const getChaptersBySubject = async (subjectId: number) => {
    const res = await API.get(`/chapters/${subjectId}`);
    return res.data;
};

export const createChapter = async (data: any) => {
    const res = await API.post("/chapters", data);
    return res.data;
};

export const updateChapter = async (id: number, data: any) => {
    const res = await API.put(`/chapters/${id}`, data);
    return res.data;
};

export const deleteChapter = async (id: number) => {
    const res = await API.delete(`/chapters/${id}`);
    return res.data;
};


export interface SyllabusAnalyzePayload {
    syllabusText?: string;
    semesterStart?: string;   // ISO date string
    semesterEnd?: string;     // ISO date string
    studyDaysPerWeek?: number;
    hoursPerDay?: number;
    language?: string;
    includeReview?: boolean;
    extraNotes?: string;
    base64File?: string;
    mimeType?: string;
}

export const uploadSyllabus = async (subjectId: number, payload?: SyllabusAnalyzePayload) => {
    const res = await API.post(`/syllabus/analyze/${subjectId}`, payload ?? {});
    return res.data;
};

export const updateSchedule = async (id: number, data: any) => {
    const res = await API.put(`/schedules/${id}`, data);
    return res.data;
};

export const deleteSchedule = async (id: number) => {
    const res = await API.delete(`/schedules/${id}`);
    return res.data;
};

// ─── Schedules ───────────────────────────────────
export const getSchedules = async (from?: string, to?: string) => {
    let url = `/schedules`;
    if (from && to) url += `?from=${from}&to=${to}`;
    const res = await API.get(url);
    return res.data;
};

export const createSchedule = async (data: any) => {
    const res = await API.post("/schedules", data);
    return res.data;
};

export const clearSubjectSchedules = async (subjectId: number) => {
    const res = await API.delete(`/schedules/subject/${subjectId}`);
    return res.data;
};

export const analyzeFeasibility = async (data: { subjectId: number, currentDate?: string }) => {
    const res = await API.post("/schedules/analyze-feasibility", data);
    return res.data;
};

export const updateScheduleStatus = async (id: number, status: string) => {
    const res = await API.put(`/schedules/${id}/status`, { status });
    return res.data;
};

export const generateSchedule = async (data: {
    subjectId: number;
    startDate?: string;
    endDate?: string;
    preferredStartTime?: string;
    maxHoursPerDay?: number;
    clearExisting?: boolean;
    preferredDaysOfWeek?: number[];
}) => {
    // Provide sensible defaults if not supplied
    const now = new Date();
    const defaultStart = now.toISOString();
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days
    const payload = {
        subjectId: data.subjectId,
        startDate: data.startDate ?? defaultStart,
        endDate: data.endDate ?? defaultEnd,
        preferredStartTime: data.preferredStartTime,
        maxHoursPerDay: data.maxHoursPerDay,
        clearExisting: data.clearExisting,
        preferredDaysOfWeek: data.preferredDaysOfWeek,
    };
    const res = await API.post("/schedules/generate", payload);
    return res.data;
};

export const analyzeScreenshot = async (data: { base64Image: string }) => {
    const res = await API.post("/schedules/analyze-screenshot", data);
    return res.data;
};

// ─── Assignments ─────────────────────────────────
export const getAssignments = async () => {
    const res = await API.get(`/assignments`);
    return res.data;
};

export const createAssignment = async (data: any) => {
    const res = await API.post("/assignments", data);
    return res.data;
};

export const updateAssignment = async (id: number, data: any) => {
    const res = await API.put(`/assignments/${id}`, data);
    return res.data;
};

export const deleteAssignment = async (id: number) => {
    const res = await API.delete(`/assignments/${id}`);
    return res.data;
};

// ─── Notifications ───────────────────────────────
export const getNotifications = async () => {
    const res = await API.get(`/notifications`);
    return res.data;
};

export const getUnreadCount = async () => {
    const res = await API.get(`/notifications/unread-count`);
    return res.data;
};

export const markNotificationRead = async (id: number) => {
    const res = await API.put(`/notifications/${id}/read`);
    return res.data;
};

export const markAllNotificationsRead = async () => {
    const res = await API.put(`/notifications/read-all`);
    return res.data;
};

// ─── Progress / Dashboard ────────────────────────
export const getDashboard = async () => {
    const res = await API.get(`/progress/dashboard`);
    return res.data;
};

export const updateProgress = async (data: any) => {
    const res = await API.put("/progress/update", data);
    return res.data;
};

export const generateStudyContent = async (scheduleId: number) => {
    const res = await API.post(`/schedules/${scheduleId}/generate-content`);
    return res.data.content as string;
};

// ─── Premium ─────────────────────────────────────
export const submitPremiumRequest = async (transactionInfo: string = "SEMIPLAN_PREMIUM") => {
    const res = await API.post("/premium/request", { transactionInfo });
    return res.data;
};

export const getPremiumStatus = async () => {
    const res = await API.get("/premium/status");
    return res.data;
};

export const getAdminPendingPayments = async () => {
    const res = await API.get("/premium/admin/pending");
    return res.data;
};

export const getAdminAllPayments = async () => {
    const res = await API.get("/premium/admin/all");
    return res.data;
};

export const adminApprovePayment = async (paymentId: number, approve: boolean) => {
    const res = await API.put(`/premium/admin/${paymentId}`, { approve });
    return res.data;
};

export default API;