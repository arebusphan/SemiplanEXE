import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubjectById, getChaptersBySubject, updateChapter, deleteChapter } from "../api/api";

import type { Subject, Chapter } from "../types";
import {
    BookOpen, Calendar, Clock, ArrowLeft, FileText,
    CheckCircle2, Circle, BrainCircuit, Pencil, Trash2,
    ChevronDown, ChevronUp, Save, X, Target, GraduationCap
} from "lucide-react";
import UploadSyllabusModal from "../components/UploadSyllabusModal";

export default function SubjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Chapter>>({});
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const [subjData, chapData] = await Promise.all([
                    getSubjectById(parseInt(id)),
                    getChaptersBySubject(parseInt(id))
                ]);
                setSubject(subjData);
                setChapters(chapData);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    if (!subject) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-slate-500 text-lg">Subject not found.</p>
            <button onClick={() => navigate('/subjects')} className="text-primary-600 hover:underline">← Back to Subjects</button>
        </div>
    );

    const completedChapters = chapters.filter(c => c.status === 'completed').length;
    const progress = chapters.length ? Math.round((completedChapters / chapters.length) * 100) : 0;
    const totalHours = chapters.reduce((sum, c) => sum + c.estimatedHours, 0);
    const daysUntilExam = Math.ceil((new Date(subject.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const startEdit = (chapter: Chapter) => {
        setEditingId(chapter.id);
        setEditForm({ title: chapter.title, description: chapter.description, estimatedHours: chapter.estimatedHours, difficulty: chapter.difficulty });
    };

    const saveEdit = async (chapterId: number) => {
        try {
            const updated = await updateChapter(chapterId, editForm);
            setChapters(prev => prev.map(c => c.id === chapterId ? updated : c));
            setEditingId(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (chapterId: number) => {
        if (!confirm("Delete this chapter?")) return;
        await deleteChapter(chapterId);
        setChapters(prev => prev.filter(c => c.id !== chapterId));
    };



    return (
        <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/subjects')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Subjects
            </button>

            {/* Subject Header Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: subject.color || '#6366f1' }} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: subject.color || '#6366f1' }}>
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-1">{subject.title}</h1>
                            <p className="text-slate-500 max-w-xl">{subject.description}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Exam Date</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            {new Date(subject.examDate).toLocaleDateString()}
                        </p>
                        <p className={`text-xs mt-1 font-medium ${daysUntilExam <= 7 ? 'text-red-500' : daysUntilExam <= 14 ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {daysUntilExam > 0 ? `${daysUntilExam} days left` : 'Exam passed'}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Study Hours</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            {totalHours > 0 ? totalHours : subject.estimatedStudyHours}h total
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Chapters</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            {completedChapters}/{chapters.length} done
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Difficulty</p>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-2 flex-1 rounded-full ${i <= subject.difficulty ? 'bg-orange-500' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-bold text-slate-700">Overall Progress</p>
                        <p className="text-sm font-bold text-primary-600">{progress}%</p>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: subject.color || '#6366f1' }} />
                    </div>
                </div>
            </div>

            {/* Chapters Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Syllabus Chapters</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-accent-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                        >
                            <BrainCircuit className="w-4 h-4" />
                            {chapters.length > 0 ? 'Re-analyze' : 'AI Extract Syllabus'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                    {chapters.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-pink-50 text-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-bold text-slate-800 mb-2">No chapters yet</p>
                            <p className="text-slate-500 mb-6">Upload your syllabus PDF/DOCX and let AI extract chapters with estimated study times.</p>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="inline-flex items-center gap-2 text-white bg-accent-500 hover:bg-accent-600 px-5 py-2.5 rounded-xl font-semibold transition-colors"
                            >
                                <BrainCircuit className="w-4 h-4" /> Upload Syllabus
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {chapters.map((chapter) => (
                                <div key={chapter.id} className="transition-colors">
                                    {editingId === chapter.id ? (
                                        /* Edit Mode */
                                        <div className="p-4 bg-primary-50/50 border-l-4 border-primary-400">
                                            <div className="grid grid-cols-1 gap-3">
                                                <input
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                                    value={editForm.title || ''}
                                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    placeholder="Chapter title"
                                                />
                                                <textarea
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                                                    value={editForm.description || ''}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                    rows={2}
                                                    placeholder="Description"
                                                />
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-slate-500 font-medium">Estimated Hours</label>
                                                        <input
                                                            type="number" min={1} max={50}
                                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                                            value={editForm.estimatedHours || ''}
                                                            onChange={e => setEditForm({ ...editForm, estimatedHours: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-slate-500 font-medium">Difficulty (1–5)</label>
                                                        <input
                                                            type="number" min={1} max={5}
                                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                                            value={editForm.difficulty || ''}
                                                            onChange={e => setEditForm({ ...editForm, difficulty: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                        <X className="w-3.5 h-3.5" /> Cancel
                                                    </button>
                                                    <button onClick={() => saveEdit(chapter.id)} className="flex items-center gap-1 px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                                        <Save className="w-3.5 h-3.5" /> Save
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View Mode */
                                        <div
                                            className="p-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-slate-400 font-bold w-6 text-center text-sm">{chapter.orderIndex}</div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${chapter.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                    {chapter.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-white" />}
                                                    {chapter.status !== 'completed' && <Circle className="w-5 h-5 text-slate-300" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-800 truncate">{chapter.title}</h4>
                                                        <button onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                                                            {expandedId === chapter.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {expandedId === chapter.id && (
                                                        <div className="mt-2 space-y-3">
                                                            <p className="text-sm text-slate-500 leading-relaxed">{chapter.description}</p>
                                                            
                                                            {/* Lessons */}
                                                            {chapter.lessons && chapter.lessons.length > 0 && (
                                                                <div className="mt-4 space-y-3">
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <GraduationCap className="w-3.5 h-3.5" /> {chapter.lessons.length} Lesson{chapter.lessons.length > 1 ? 's' : ''}
                                                                    </p>
                                                                    {chapter.lessons.map((lesson) => (
                                                                        <div key={lesson.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                                                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                                                <h5 className="font-semibold text-sm text-slate-800">{lesson.orderIndex}. {lesson.title}</h5>
                                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                                                                                        <Clock className="w-3 h-3" /> {lesson.durationMinutes}m
                                                                                    </span>
                                                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                                                        lesson.difficulty >= 4 ? 'bg-red-50 text-red-600' :
                                                                                        lesson.difficulty >= 3 ? 'bg-orange-50 text-orange-600' :
                                                                                        'bg-emerald-50 text-emerald-600'
                                                                                    }`}>
                                                                                        {lesson.difficulty >= 4 ? 'Hard' : lesson.difficulty >= 3 ? 'Medium' : 'Easy'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 leading-relaxed mb-3">{lesson.description}</p>
                                                                            {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                                                        <Target className="w-3 h-3" /> Learning Objectives
                                                                                    </p>
                                                                                    <ul className="space-y-1">
                                                                                        {lesson.learningObjectives.map((obj, i) => (
                                                                                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                                                                                                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                                                                                                <span>{obj}</span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="flex gap-0.5">
                                                        {[1,2,3,4,5].map(i => (
                                                            <div key={i} className={`w-1.5 h-4 rounded-full ${i <= chapter.difficulty ? 'bg-orange-400' : 'bg-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-slate-500 flex items-center gap-1 w-14">
                                                        <Clock className="w-3.5 h-3.5" />{chapter.estimatedHours}h
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => startEdit(chapter)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(chapter.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </div>

            <UploadSyllabusModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                subjectId={parseInt(id || "0")}
                onSuccess={(newChapters) => {
                    setChapters(newChapters);
                }}
            />
        </div>
    );
}
