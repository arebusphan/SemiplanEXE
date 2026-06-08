import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateStudyContent } from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BrainCircuit, CheckCircle2 } from "lucide-react";

export default function StudySessionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchContent = async () => {
            setLoading(true);
            try {
                const markdown = await generateStudyContent(parseInt(id));
                setContent(markdown);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to generate study content. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in-up">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Calendar
            </button>

            {loading ? (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                            <BrainCircuit className="w-10 h-10 text-primary-600 animate-pulse" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full border-4 border-white animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">AI is preparing your lesson...</h2>
                    <p className="text-slate-500">Generating comprehensive study notes based on your syllabus.</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center">
                    <p className="font-bold">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                            <BrainCircuit className="w-4 h-4" /> AI Generated Content
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Study Session</h1>
                        <p className="text-primary-100 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Read carefully to master this topic.
                        </p>
                    </div>
                    
                    <div className="p-8 sm:p-12 prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-primary-600 prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>

                    <div className="bg-slate-50 p-6 border-t border-slate-200/60 flex justify-end">
                        <button 
                            onClick={() => navigate(-1)}
                            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-primary-500/25"
                        >
                            Finish Studying
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
