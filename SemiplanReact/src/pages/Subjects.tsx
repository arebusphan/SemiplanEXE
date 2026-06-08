import { useEffect, useState } from "react";
import { getSubjects } from "../api/api";
import { useAuth } from "../context/AuthContext";
import type { Subject } from "../types";
import { BookOpen, Calendar, Clock, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddSubjectModal from "../components/AddSubjectModal";
import { createSubject, deleteSubject } from "../api/api";

export default function SubjectsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                if (user) {
                    const data = await getSubjects();
                    setSubjects(data.filter((s: Subject) => s.userId === user.id));
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [user]);

    const handleAddSubject = async (data: any) => {
        const newSubject = await createSubject(data);
        setSubjects([...subjects, newSubject]);
    };

    const handleDeleteSubject = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this subject?")) {
            try {
                await deleteSubject(id);
                setSubjects(subjects.filter(s => s.id !== id));
            } catch (error) {
                console.error("Failed to delete subject", error);
            }
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">
                        Subjects
                    </h1>
                    <p className="text-slate-500">
                        Manage your study materials and chapters
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 w-full sm:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Subject</span>
                    </button>
                </div>
            </div>

            {filteredSubjects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                    <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No subjects found</h3>
                    <p className="text-slate-500 mb-6">You haven't added any subjects yet or none match your search.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Your First Subject
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
                    {filteredSubjects.map((subject) => (
                        <div
                            key={subject.id || Math.random()}
                            onClick={() => {
                                if (subject.id) navigate(`/subjects/${subject.id}`);
                                else window.location.reload();
                            }}
                            className="group bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-1"
                                style={{ backgroundColor: subject.color || '#6366f1' }}
                            />

                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${subject.color || '#6366f1'}15` }}>
                                    <BookOpen className="w-6 h-6" style={{ color: subject.color || '#6366f1' }} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${subject.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {subject.status || 'Active'}
                                    </span>
                                    <button
                                        onClick={(e) => handleDeleteSubject(e, subject.id!)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">
                                {subject.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                                {subject.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{subject.estimatedStudyHours}h est.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{new Date(subject.examDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                <span className="font-semibold text-primary-600">View Details</span>
                                <ChevronRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {user && (
                <AddSubjectModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddSubject}
                    userId={user.id}
                />
            )}
        </div>
    );
}