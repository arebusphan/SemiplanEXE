import { useEffect, useState } from "react";
import { getAssignments } from "../api/api";
import { useAuth } from "../context/AuthContext";
import type { Assignment } from "../types";
import { ClipboardList, Plus, Calendar as CalIcon, Clock, CheckCircle2, Circle } from "lucide-react";

export default function AssignmentsPage() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                if (user) {
                    const data = await getAssignments();
                    setAssignments(data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Assignments</h1>
                    <p className="text-slate-500">Track your projects, essays, and homework</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all active:scale-[0.98]">
                    <Plus className="w-4 h-4" /> Add Assignment
                </button>
            </div>

            {assignments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                    <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No assignments yet</h3>
                    <p className="text-slate-500 mb-6">Keep track of your deadlines by adding assignments.</p>
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                        <Plus className="w-4 h-4" /> Create First Assignment
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columns: Todo, In Progress, Done */}
                    {['pending', 'in-progress', 'done'].map(status => {
                        const colAssignments = assignments.filter(a => a.status === status);
                        const titles = { 'pending': 'To Do', 'in-progress': 'In Progress', 'done': 'Completed' };
                        const colors = { 'pending': 'bg-slate-100', 'in-progress': 'bg-blue-50', 'done': 'bg-emerald-50' };
                        const textColors = { 'pending': 'text-slate-700', 'in-progress': 'text-blue-700', 'done': 'text-emerald-700' };

                        return (
                            <div key={status} className="flex flex-col h-full">
                                <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${colors[status as keyof typeof colors]}`}>
                                    <h3 className={`font-bold ${textColors[status as keyof typeof textColors]}`}>{titles[status as keyof typeof titles]}</h3>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">{colAssignments.length}</span>
                                </div>

                                <div className="space-y-4 flex-1">
                                    {colAssignments.map(assignment => (
                                        <div key={assignment.id} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-100" style={{ color: assignment.subjectColor || '#6366f1', backgroundColor: `${assignment.subjectColor || '#6366f1'}10` }}>
                                                    {assignment.subjectTitle}
                                                </span>
                                                <button className="text-slate-400 hover:text-emerald-500 transition-colors">
                                                    {status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            
                                            <h4 className="font-bold text-slate-800 mb-1">{assignment.title}</h4>
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{assignment.description}</p>
                                            
                                            <div className="flex items-center justify-between text-xs font-medium">
                                                <div className="flex items-center gap-1.5 text-danger-500 bg-danger-50 px-2 py-1 rounded-lg">
                                                    <CalIcon className="w-3.5 h-3.5" />
                                                    {new Date(assignment.deadline).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {assignment.estimatedHours}h
                                                </div>
                                            </div>

                                            {status === 'in-progress' && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <div className="flex justify-between text-xs mb-1 font-medium">
                                                        <span className="text-slate-500">Progress</span>
                                                        <span className="text-primary-600">{assignment.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${assignment.progress}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
