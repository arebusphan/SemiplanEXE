import { useEffect, useState } from "react";
import { getSchedules, updateScheduleStatus, createSchedule, deleteSchedule, updateSchedule, getSubjects, getChaptersBySubject, generateSchedule, analyzeScreenshot, clearSubjectSchedules, getUserAvailabilities } from "../api/api";





import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Schedule, Subject, Chapter } from "../types";
import { 
    Clock, ChevronLeft, ChevronRight, Wand2, X, 
    CheckCircle2, BrainCircuit, BookOpen, Sparkles, Lock, Trash2, RefreshCw, Upload, Plus
} from "lucide-react";

export default function CalendarPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [availabilities, setAvailabilities] = useState<any[]>([]);

    // Sync Calendar modal state
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectChapters, setSelectedSubjectChapters] = useState<Chapter[]>([]);
    const [loadingChapters, setLoadingChapters] = useState(false);

    // Drawer state
    const [selectedSession, setSelectedSession] = useState<Schedule | null>(null);
    const [draggedSession, setDraggedSession] = useState<Schedule | null>(null);

    const [syncSubjectId, setSyncSubjectId] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // When syncSubjectId changes, fetch chapters for the selected subject
    const handleSyncSubjectChange = async (subjectIdStr: string) => {
        setSyncSubjectId(subjectIdStr);
        setSelectedSubjectChapters([]);
        if (!subjectIdStr) return;
        setLoadingChapters(true);
        try {
            const chapters = await getChaptersBySubject(parseInt(subjectIdStr));
            setSelectedSubjectChapters(chapters);
        } catch (err) {
            console.error('Failed to load chapters', err);
        } finally {
            setLoadingChapters(false);
        }
    };

    // Manual / Screenshot Modal State
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualForm, setManualForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        subjectId: ''
    });
    
    const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isAnalyzingScreenshot, setIsAnalyzingScreenshot] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user) {
                const [schedData, availData] = await Promise.all([
                    getSchedules(),
                    getUserAvailabilities()
                ]);
                setSchedules(schedData);
                setAvailabilities(availData);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    useEffect(() => {
        if (isSyncModalOpen && subjects.length === 0) {
            getSubjects().then(setSubjects).catch(console.error);
        }
    }, [isSyncModalOpen]);

    useEffect(() => {
        if (manualModalOpen && subjects.length === 0) {
            getSubjects().then(setSubjects).catch(console.error);
        }
    }, [manualModalOpen]);

    const getDaysInWeek = () => {
        const days = [];
        const base = new Date(currentDate);
        const dayOfWeek = base.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        base.setDate(base.getDate() + diff);
        for (let i = 0; i < 7; i++) {
            const day = new Date(base);
            day.setDate(base.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const days = getDaysInWeek();

    // -- Handlers --
    const handleMarkComplete = async (sched: Schedule) => {
        const newStatus = sched.status === 'completed' ? 'pending' : 'completed';
        // Optimistic update
        setSchedules(prev => prev.map(s => s.id === sched.id ? { ...s, status: newStatus } : s));
        try {
            await updateScheduleStatus(sched.id, newStatus);
        } catch (error) {
            console.error(error);
            // Revert on error
            setSchedules(prev => prev.map(s => s.id === sched.id ? { ...s, status: sched.status } : s));
        }
    };

    const handleCellClick = (dateStr: string, hour: number) => {
        setManualForm({
            date: dateStr,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 2).toString().padStart(2, '0')}:00`,
            title: '',
            description: '',
            subjectId: ''
        });
        setManualModalOpen(true);
    };

    const handleSaveManualSchedule = async () => {
        if (!user || !manualForm.title || !manualForm.startTime || !manualForm.endTime) return;

        // compute duration
        const [sh, sm] = manualForm.startTime.split(':').map(Number);
        const [eh, em] = manualForm.endTime.split(':').map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);

        try {
            const data = {
                userId: user.id,
                title: manualForm.title,
                description: manualForm.description,
                date: manualForm.date,
                startTime: manualForm.startTime,
                endTime: manualForm.endTime,
                duration: duration > 0 ? duration : 60,
                priority: 1,
                subjectId: manualForm.subjectId ? parseInt(manualForm.subjectId) : null
            };
            const newBlock = await createSchedule(data);
            setSchedules(prev => [...prev, newBlock]);
            setManualModalOpen(false);
        } catch (error) {
            console.error("Failed to create manual schedule", error);
        }
    };

    const handleUploadScreenshot = async () => {
        if (!screenshotFile || !user) return;
        setIsAnalyzingScreenshot(true);

        try {
            // Resize image before sending
            const resizeImage = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let { width, height } = img;
                            const MAX_SIZE = 1600;
                            
                            if (width > height && width > MAX_SIZE) {
                                height = Math.round((height * MAX_SIZE) / width);
                                width = MAX_SIZE;
                            } else if (height > MAX_SIZE) {
                                width = Math.round((width * MAX_SIZE) / height);
                                height = MAX_SIZE;
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                        img.onerror = reject;
                        img.src = e.target?.result as string;
                    };
                    reader.onerror = reject;
                });
            };

            const base64 = await resizeImage(screenshotFile);
            const parsed = await analyzeScreenshot({ base64Image: base64 });
            
            // Add the parsed schedules
                for (const item of parsed) {
                    // Match 'day' to the current week's dates
                    const targetDay = days.find(d => d.toLocaleDateString('en-US', { weekday: 'long' }) === item.day);
                    if (targetDay) {
                        const [sh, sm] = item.start.split(':').map(Number);
                        const [eh, em] = item.end.split(':').map(Number);
                        const duration = (eh * 60 + em) - (sh * 60 + sm);

                        await createSchedule({
                            userId: user.id,
                            title: item.title,
                            description: item.description || '',
                            date: targetDay.toLocaleDateString('en-CA'),
                            startTime: item.start,
                            endTime: item.end,
                            duration: duration > 0 ? duration : 60,
                            priority: 1
                        });
                    }
            }
            
            setScreenshotModalOpen(false);
            setScreenshotFile(null);
            fetchData();
        } catch (error: any) {
            console.error("Failed to analyze screenshot", error);
            alert("Failed to analyze screenshot. See console for details. " + (error.response?.data?.message || error.message));
        } finally {
            setIsAnalyzingScreenshot(false);
        }
    };

    const handleRemoveBusyBlock = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm("Remove this busy block?")) {
            try {
                await deleteSchedule(id);
                setSchedules(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                console.error("Failed to delete busy block", error);
            }
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
    };

    const handleDragStart = (e: React.DragEvent, sched: Schedule) => {
        setDraggedSession(sched);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, dateStr: string, hour: number) => {
        e.preventDefault();
        if (!draggedSession) return;

        const newStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const endHour = Math.floor(hour + draggedSession.duration / 60);
        const endMin = draggedSession.duration % 60;
        const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

        // Optimistic update
        setSchedules(prev => prev.map(s => s.id === draggedSession.id ? {
            ...s,
            date: dateStr,
            startTime: newStartTime,
            endTime: newEndTime
        } : s));

        try {
            await updateSchedule(draggedSession.id, {
                date: dateStr,
                startTime: newStartTime,
                endTime: newEndTime
            });
        } catch (error) {
            console.error("Failed to update schedule", error);
            // Revert on error
            fetchData();
        }
        setDraggedSession(null);
    };

    const handleSync = async () => {
        if (!syncSubjectId) {
            alert("Please select a subject");
            return;
        }
        setIsGenerating(true);
        try {
            await generateSchedule({
                subjectId: parseInt(syncSubjectId),
                clearExisting: true,
            });
            setIsSyncModalOpen(false);
            setSyncSubjectId('');
            setSelectedSubjectChapters([]);
            fetchData();
        } catch (error: any) {
            console.error(error);
            alert("Failed to generate schedule. Check console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearSubject = async () => {
        if (!syncSubjectId) {
            alert("Please select a subject");
            return;
        }
        if (window.confirm("Are you sure you want to delete all AI-generated schedules for this subject?")) {
            setIsGenerating(true);
            try {
                await clearSubjectSchedules(parseInt(syncSubjectId));
                setIsSyncModalOpen(false);
                fetchData();
            } catch (error: any) {
                console.error("Failed to clear subject schedules", error);
                alert("Failed to clear schedules.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Calendar</h1>
                    <p className="text-slate-500">Your AI-generated study schedule</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button 
                        onClick={() => setScreenshotModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
                    >
                        <Upload className="w-4 h-4" /> Screenshot
                    </button>
                    <button 
                        onClick={() => setIsSyncModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-primary-500/25"
                    >
                        <Wand2 className="w-4 h-4" /> Sync Calendar
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                <div className={`bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden relative transition-all duration-300 ${selectedSession ? 'w-[calc(100%-420px)]' : 'w-full'}`}>
                <div className="border-b border-slate-200/60 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h2 className="text-lg font-bold text-slate-800 min-w-[200px] text-center">
                            {days[0].toLocaleDateString('default', { month: 'long', day: 'numeric' })} – {days[6].toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h2>
                        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar relative">
                    <div className="min-w-[1200px] flex flex-col">
                        {/* Sticky Header Row */}
                        <div className="flex sticky top-0 z-30 bg-white border-b border-slate-200/60 shadow-sm">
                            <div className="w-16 flex-shrink-0 border-r border-slate-200/60 bg-white" />
                            <div className="flex-1 grid grid-cols-7">
                                {days.map((day, i) => {
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={`header-${i}`} className={`p-2 border-r border-slate-200/60 text-center ${isToday ? 'bg-primary-50' : ''}`}>
                                            <p className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-primary-600' : 'text-slate-500'}`}>
                                                {day.toLocaleDateString('default', { weekday: 'short' })}
                                            </p>
                                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${isToday ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'text-slate-800'}`}>
                                                {day.getDate()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grid Body */}
                        <div className="flex flex-1 relative">
                            {/* Time labels */}
                            <div className="w-16 flex-shrink-0 border-r border-slate-200/60 bg-slate-50/50">
                                {Array.from({ length: 18 }).map((_, i) => (
                                    <div key={`time-${i}`} className="h-20 border-b border-slate-100 text-[10px] text-slate-400 font-bold text-right pr-2 pt-1">
                                        {i + 6}:00
                                    </div>
                                ))}
                            </div>

                            {/* Day columns */}
                            <div className="flex-1 grid grid-cols-7">
                                {days.map((day, i) => {
                                    const dayStr = day.toLocaleDateString('en-CA');
                                    
                                    // Calculate overlapping schedules
                                    // Combine regular schedules and availability busy blocks
                                    const rawDaySchedules = [...schedules.filter(s => s.date === dayStr), 
                                        ...availabilities.filter(a => a.type === 'Busy' && a.dayOfWeek === day.getDay()).map(a => ({
                                            id: `avail-${a.id}`, // pseudo id
                                            title: a.label || 'Busy',
                                            description: 'Fixed Schedule',
                                            date: dayStr,
                                            startTime: a.startTime,
                                            endTime: a.endTime,
                                            subjectId: null, // renders as busy block
                                            duration: 0, // calculate below
                                            isAvailability: true
                                        }))
                                    ].map(s => {
                                        const [sh, sm] = s.startTime.split(':').map(Number);
                                        const [eh, em] = s.endTime.split(':').map(Number);
                                        const startMins = sh * 60 + sm;
                                        const endMins = eh * 60 + em;
                                        return { ...s, startMins, endMins };
                                    }).sort((a, b) => a.startMins - b.startMins);

                                    const clusters: (typeof rawDaySchedules)[] = [];
                                    let currentCluster: typeof rawDaySchedules = [];
                                    let clusterEnd = -1;

                                    rawDaySchedules.forEach(s => {
                                        if (s.startMins > clusterEnd) {
                                            if (currentCluster.length > 0) clusters.push(currentCluster);
                                            currentCluster = [s];
                                            clusterEnd = s.endMins;
                                        } else {
                                            currentCluster.push(s);
                                            clusterEnd = Math.max(clusterEnd, s.endMins);
                                        }
                                    });
                                    if (currentCluster.length > 0) clusters.push(currentCluster);

                                    const positionedSchedules = clusters.flatMap(cluster => {
                                        const columns: typeof rawDaySchedules[] = [];
                                        const withCol = cluster.map(s => {
                                            let placed = false;
                                            let colIdx = 0;
                                            for (let c = 0; c < columns.length; c++) {
                                                const overlaps = columns[c].some(existing => s.startMins < existing.endMins && s.endMins > existing.startMins);
                                                if (!overlaps) {
                                                    columns[c].push(s);
                                                    colIdx = c;
                                                    placed = true;
                                                    break;
                                                }
                                            }
                                            if (!placed) {
                                                columns.push([s]);
                                                colIdx = columns.length - 1;
                                            }
                                            return { ...s, colIdx };
                                        });
                                        return withCol.map(s => ({ ...s, maxCols: columns.length }));
                                    });

                                    return (
                                        <div key={`col-${i}`} className="border-r border-slate-200/60 relative">
                                            {/* Grid Lines */}
                                            {Array.from({ length: 18 }).map((_, j) => (
                                                <div 
                                                    key={`cell-${j}`} 
                                                    className="h-20 border-b border-slate-100 cursor-pointer hover:bg-primary-50/30 transition-colors group relative"
                                                    onClick={() => handleCellClick(dayStr, j + 6)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, dayStr, j + 6)}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md border border-primary-100"><Plus className="w-3 h-3 inline-block" /> Add Schedule</span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Render Blocks */}
                                            {positionedSchedules.map(block => {
                                                const top = ((block.startMins - 6 * 60) / 60) * 80;
                                                const height = Math.max(20, ((block.endMins - block.startMins) / 60) * 80);
                                                const leftPct = (block.colIdx / block.maxCols) * 100;
                                                const widthPct = (1 / block.maxCols) * 100;
                                                const isBusyBlock = block.subjectId == null;

                                                if (isBusyBlock) {
                                                    const isAvailability = (block as any).isAvailability;
                                                    return (
                                                        <div 
                                                            key={block.id} 
                                                            className={`absolute rounded border border-dashed flex flex-col items-center justify-center group z-10 transition-colors ${isAvailability ? 'bg-amber-100/70 border-amber-300 text-amber-700' : 'bg-slate-200/70 border-slate-300 text-slate-600 hover:border-red-400 hover:bg-red-50 cursor-pointer'}`} 
                                                            style={{ 
                                                                top: `${top}px`, 
                                                                height: `${height}px`,
                                                                left: `calc(${leftPct}% + 2px)`,
                                                                width: `calc(${widthPct}% - 4px)`
                                                            }}
                                                            onClick={(e) => {
                                                                if (!isAvailability) handleRemoveBusyBlock(e, block.id as number);
                                                            }}
                                                            title={isAvailability ? "Fixed Schedule (Settings)" : "Click to remove"}
                                                        >
                                                            <Lock className="w-4 h-4 mb-1 opacity-50 group-hover:hidden" />
                                                            {!isAvailability && <Trash2 className="w-4 h-4 mb-1 text-red-500 hidden group-hover:block" />}
                                                            <span className="text-xs font-bold uppercase tracking-widest text-center truncate w-full px-1">{block.title}</span>
                                                        </div>
                                                    );
                                                } else {
                                                    const isDone = block.status === 'completed';
                                                    return (
                                                        <div
                                                            key={block.id}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, block)}
                                                            onClick={() => setSelectedSession(block as any)}
                                                            className={`absolute rounded-xl p-2 text-xs overflow-hidden border shadow-sm group transition-all hover:shadow-md cursor-pointer z-20 ${isDone ? 'opacity-50 grayscale' : 'hover:-translate-y-0.5'} ${draggedSession?.id === block.id ? 'opacity-50' : ''}`}
                                                            style={{
                                                                top: `${top}px`, 
                                                                height: `${height}px`,
                                                                left: `calc(${leftPct}% + 2px)`,
                                                                width: `calc(${widthPct}% - 4px)`,
                                                                backgroundColor: `${block.subjectColor || '#6366f1'}15`,
                                                                borderLeft: `4px solid ${block.subjectColor || '#6366f1'}`,
                                                                borderColor: `${block.subjectColor || '#6366f1'}40`,
                                                            }}
                                                        >
                                                            <p className="font-bold text-slate-800 text-sm truncate">{block.chapterTitle || block.title}</p>
                                                            <p className="text-slate-600 font-medium truncate mb-1">{block.subjectTitle}</p>
                                                            <div className="flex items-center gap-2 mt-auto text-slate-500 font-medium">
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {block.duration}m</span>
                                                                {block.aiGenerated && <span className="flex items-center gap-1 text-primary-600 bg-primary-100/50 px-1.5 py-0.5 rounded"><BrainCircuit className="w-3 h-3" /> AI</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Panel for Session Details */}
            {selectedSession && (
                <div className="w-[420px] bg-white shadow-sm border border-slate-200/60 rounded-3xl overflow-y-auto shrink-0 animate-fade-in-right">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" /> AI Lesson Plan
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedSession.title}</h2>
                        <p className="text-slate-500 font-medium flex items-center gap-2 mb-6">
                            <BookOpen className="w-4 h-4" /> {selectedSession.subjectTitle}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Duration</p>
                                <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary-500" /> {selectedSession.duration} min
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4 text-primary-500" /> Description
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed bg-primary-50/50 p-4 rounded-2xl border border-primary-100">
                                    {selectedSession.description || "No description provided for this session."}
                                </p>
                            </div>
                        </div>
                        

                        <button 
                            onClick={() => navigate(`/study/${selectedSession.id}`)}
                            className="w-full mt-4 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-5 h-5" /> Start Studying
                        </button>

                        <div className="mt-6 pt-6 border-t border-slate-200 flex gap-3">
                            <button 
                                onClick={() => { handleMarkComplete(selectedSession); setSelectedSession(null); }}
                                className="flex-1 bg-success-500 text-white py-3 rounded-xl font-bold hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Mark Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Calendar Modal */}
            {isSyncModalOpen && (() => {
                const selectedSubject = subjects.find(s => s.id === parseInt(syncSubjectId));
                const totalLessons = selectedSubjectChapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);
                const hasChapters = selectedSubjectChapters.length > 0;
                const examDate = selectedSubject?.examDate ? new Date(selectedSubject.examDate) : null;
                const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                const weeksUntilExam = daysUntilExam != null ? Math.max(1, Math.ceil(daysUntilExam / 7)) : null;
                const lessonsPerWeek = weeksUntilExam && totalLessons ? Math.ceil(totalLessons / weeksUntilExam) : null;

                return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[460px] shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary-500"/> Generate Study Schedule</h2>
                            <button onClick={() => { setIsSyncModalOpen(false); setSelectedSubjectChapters([]); setSyncSubjectId(''); }} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Subject</label>
                                <select 
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary-500"
                                    value={syncSubjectId}
                                    onChange={e => handleSyncSubjectChange(e.target.value)}
                                >
                                    <option value="">-- Select a subject --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>

                            {/* Loading chapters indicator */}
                            {loadingChapters && (
                                <div className="flex items-center justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                                    <span className="ml-2 text-sm text-slate-500">Loading subject data...</span>
                                </div>
                            )}

                            {/* Subject info card */}
                            {syncSubjectId && !loadingChapters && (
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                    {!hasChapters ? (
                                        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                            <BrainCircuit className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-amber-800">No chapters found</p>
                                                <p className="text-xs text-amber-600">Go to the Subject page and run AI Syllabus Analysis first to extract chapters & lessons.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-slate-800">{selectedSubjectChapters.length}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chapters</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-slate-800">{totalLessons}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lessons</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-slate-800">{examDate ? `${daysUntilExam}d` : '—'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Until Exam</p>
                                                </div>
                                            </div>
                                            {examDate && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white rounded-lg px-3 py-2 border border-slate-100">
                                                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                                                    <span>Exam: <strong className="text-slate-700">{examDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
                                                </div>
                                            )}
                                            {lessonsPerWeek && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-primary-50 rounded-lg px-3 py-2 border border-primary-100">
                                                    <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                                                    <span>AI will distribute <strong className="text-primary-700">~{lessonsPerWeek} lesson{lessonsPerWeek > 1 ? 's' : ''}/week</strong> across <strong className="text-primary-700">{weeksUntilExam} week{weeksUntilExam! > 1 ? 's' : ''}</strong></span>
                                                </div>
                                            )}
                                            {!examDate && (
                                                <div className="flex items-center gap-2 text-xs p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                                    <span className="text-amber-600">⚠️ No exam date set. Go to Subject → Re-analyze to set an exam date for better scheduling.</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-2 mt-2">
                                <button 
                                    onClick={handleSync} 
                                    disabled={isGenerating || !syncSubjectId || !hasChapters}
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all"
                                >
                                    {isGenerating ? (
                                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Generating...</>
                                    ) : (
                                        <><Wand2 className="w-4 h-4" /> Generate AI Study Plan</>
                                    )}
                                </button>
                                <button 
                                    onClick={handleClearSubject} 
                                    disabled={isGenerating || !syncSubjectId}
                                    className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Clear Generated Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* Manual Entry Modal */}
            {manualModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[400px] shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-primary-500"/> Add Schedule</h2>
                            <button onClick={() => setManualModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                <input type="text" value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} placeholder="e.g. Work, Study Group" className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                                <input type="text" value={manualForm.description} onChange={e => setManualForm({...manualForm, description: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject (Optional)</label>
                                <select 
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary-500"
                                    value={manualForm.subjectId}
                                    onChange={e => setManualForm({...manualForm, subjectId: e.target.value})}
                                >
                                    <option value="">-- No Subject (Busy Block) --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                                    <input type="time" value={manualForm.startTime} onChange={e => setManualForm({...manualForm, startTime: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                                    <input type="time" value={manualForm.endTime} onChange={e => setManualForm({...manualForm, endTime: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary-500" />
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveManualSchedule} 
                                className="w-full mt-2 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 flex justify-center items-center gap-2"
                            >
                                Save Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Screenshot Upload Modal */}
            {screenshotModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[400px] shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Upload className="w-5 h-5 text-indigo-500"/> Upload Schedule</h2>
                            <button onClick={() => setScreenshotModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Upload a screenshot of your schedule. AI will parse it and add the classes/events to this week.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-500"><span className="font-bold text-primary-600">Click to upload</span> or drag and drop</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setScreenshotFile(e.target.files?.[0] || null)} />
                                </label>
                                {screenshotFile && <p className="text-sm font-semibold text-emerald-600 mt-2 text-center">{screenshotFile.name}</p>}
                            </div>
                            
                            <button 
                                onClick={handleUploadScreenshot} 
                                disabled={isAnalyzingScreenshot || !screenshotFile}
                                className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isAnalyzingScreenshot ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : "Analyze & Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
