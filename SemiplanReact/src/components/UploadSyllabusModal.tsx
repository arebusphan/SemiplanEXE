import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Upload, FileText, BrainCircuit, CheckCircle2,
    Calendar, Globe, StickyNote, ChevronDown
} from 'lucide-react';
import { uploadSyllabus, updateSubject, type SyllabusAnalyzePayload } from '../api/api';
// @ts-ignore
import * as mammoth from 'mammoth';

interface UploadSyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: number;
    onSuccess: (newChapters: any[]) => void;
}



const LANGUAGES = ['English', 'Vietnamese', 'French', 'German', 'Spanish', 'Japanese', 'Chinese'];

export default function UploadSyllabusModal({ isOpen, onClose, subjectId, onSuccess }: UploadSyllabusModalProps) {
    // File / text
    const [file, setFile] = useState<File | null>(null);
    const [pasteText, setPasteText] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Exam date
    const [examDate, setExamDate] = useState('');

    // AI preferences
    const [language, setLanguage] = useState('English');
    const [includeReview, setIncludeReview] = useState(true);
    const [extraNotes, setExtraNotes] = useState('');

    // Status
    const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'success'>('idle');
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) {
            const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (allowed.includes(dropped.type) || dropped.name.match(/\.(pdf|docx|txt)$/i)) {
                setFile(dropped);
                setError('');
            } else {
                setError('Only PDF, DOCX, or TXT files are supported.');
            }
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleAnalyze = async () => {
        if (!file && !pasteText.trim()) {
            setError('Please upload a file or paste syllabus text.');
            return;
        }
        if (!examDate) {
            setError('Please set the exam date.');
            return;
        }

        setError('');
        try {
            setStatus('uploading');
            await new Promise(r => setTimeout(r, 700));

            setStatus('analyzing');

            let base64File: string | undefined;
            let mimeType: string | undefined;
            let finalSyllabusText = pasteText.trim();

            if (file) {
                if (file.name.toLowerCase().endsWith('.docx')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    finalSyllabusText = result.value;
                } else if (file.name.toLowerCase().endsWith('.txt')) {
                    finalSyllabusText = await file.text();
                } else {
                    // PDF or other types
                    base64File = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    mimeType = file.type || "application/pdf";
                }
            }

            const payload: SyllabusAnalyzePayload = {
                syllabusText: finalSyllabusText || undefined,
                semesterEnd: examDate ? new Date(examDate).toISOString() : undefined,
                language,
                includeReview,
                extraNotes: extraNotes.trim() || undefined,
                base64File,
                mimeType,
            };

            const newChapters = await uploadSyllabus(subjectId, payload);

            // Save exam date to subject
            await updateSubject(subjectId, {
                examDate: examDate ? new Date(examDate).toISOString() : undefined,
            });

            setStatus('success');
            onSuccess(newChapters);
            setTimeout(() => {
                handleReset();
                onClose();
            }, 1200);
        } catch (e) {
            console.error(e);
            setError('Analysis failed. Please try again.');
            setStatus('idle');
        }
    };

    const handleReset = () => {
        setFile(null);
        setPasteText('');
        setExamDate('');
        setLanguage('English');
        setIncludeReview(true);
        setExtraNotes('');
        setError('');
        setStatus('idle');
    };

    const handleClose = () => {
        if (status === 'uploading' || status === 'analyzing') return;
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">AI Syllabus Analysis</h2>
                            <p className="text-xs text-slate-400">Upload or paste your syllabus to generate a study plan</p>
                        </div>
                    </div>
                    {status === 'idle' && (
                        <button
                            onClick={handleClose}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">

                    {/* ── Loading / Success states ── */}
                    {status === 'uploading' && (
                        <div className="py-16 flex flex-col items-center text-center">
                            <div className="w-14 h-14 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mb-5" />
                            <h3 className="text-lg font-bold text-slate-800">Uploading File…</h3>
                            <p className="text-sm text-slate-500 mt-1">Preparing your syllabus for AI analysis</p>
                        </div>
                    )}

                    {status === 'analyzing' && (
                        <div className="py-16 flex flex-col items-center text-center">
                            <div className="relative mb-5">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                                    <BrainCircuit className="w-8 h-8 text-primary-600 animate-pulse" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full border-2 border-white animate-bounce" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">AI is Analyzing…</h3>
                            <p className="text-sm text-slate-500 mt-1">Extracting chapters, topics & estimating difficulty</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-16 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">All Done! 🎉</h3>
                            <p className="text-sm text-slate-500 mt-1">Chapters & lessons extracted successfully. Go to Calendar to generate your study schedule.</p>
                        </div>
                    )}

                    {/* ── IDLE FORM ── */}
                    {status === 'idle' && (
                        <>
                            {/* ── 1. Syllabus File ── */}
                            <section>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                    Syllabus File <span className="text-danger-500">*</span>
                                </label>

                                {/* Drop zone */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                        isDragging
                                            ? 'border-primary-400 bg-primary-50'
                                            : file
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/40'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleFileChange}
                                    />
                                    {file ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                                            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="text-xs text-red-400 hover:text-red-600 mt-1 underline"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center mb-1">
                                                <Upload className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <p className="font-bold text-slate-700">Drop your syllabus file here</p>
                                            <p className="text-xs text-slate-400">PDF, DOCX, or TXT — max 10 MB</p>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-xs text-slate-400">or paste text instead</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>

                                {/* Paste area */}
                                <textarea
                                    value={pasteText}
                                    onChange={e => { setPasteText(e.target.value); if (e.target.value) setFile(null); }}
                                    rows={4}
                                    placeholder="Paste syllabus content here…"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                />
                                {pasteText && (
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        If you paste text, the file upload above is ignored.
                                    </p>
                                )}
                            </section>

                            {/* ── 2. Exam Date ── */}
                            <section>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                    Exam Date
                                </label>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-accent-500" />
                                        Exam date <span className="text-danger-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={examDate}
                                        onChange={e => setExamDate(e.target.value)}
                                        min={new Date().toLocaleDateString('en-CA')}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">The exam or deadline for this subject. Lessons will be distributed evenly until this date.</p>
                                </div>
                            </section>

                            {/* ── 3. AI Preferences ── */}
                            <section>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    AI Preferences
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md normal-case tracking-normal">optional</span>
                                </label>

                                {/* Language */}
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                                        <Globe className="w-3.5 h-3.5 text-violet-500" />
                                        Study language
                                    </label>
                                    <div className="relative w-40">
                                        <select
                                            value={language}
                                            onChange={e => setLanguage(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white transition-all cursor-pointer"
                                        >
                                            {LANGUAGES.map(l => (
                                                <option key={l}>{l}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">AI returns chapter descriptions in this language.</p>
                                </div>

                                {/* Review sessions */}
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        Include review sessions
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <label className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all ${includeReview ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${includeReview ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                                                {includeReview && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={includeReview} onChange={() => setIncludeReview(true)} />
                                            <span className="text-sm text-slate-700 font-medium">
                                                <span className="font-bold text-primary-700">Yes</span> — add a review 2 days after each chapter
                                            </span>
                                        </label>
                                        <label className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all ${!includeReview ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${!includeReview ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                                                {!includeReview && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={!includeReview} onChange={() => setIncludeReview(false)} />
                                            <span className="text-sm text-slate-700 font-medium">
                                                <span className="font-bold">No</span> — study sessions only
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Extra notes */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1.5">
                                        <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                                        Extra notes for AI
                                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">optional</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={extraNotes}
                                        onChange={e => setExtraNotes(e.target.value)}
                                        placeholder="e.g. focus on chapters 1–5 only, skip lab sections"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Any instructions to guide the AI analysis.</p>
                                </div>
                            </section>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer — always visible */}
                {status === 'idle' && (
                    <div className="px-7 py-5 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
                        <p className="text-xs text-slate-400">
                            {file ? `📎 ${file.name}` : pasteText ? '📝 Text pasted' : 'No content selected'}
                        </p>
                        <button
                            onClick={handleAnalyze}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                            <BrainCircuit className="w-4 h-4" />
                            Analyze syllabus ↗
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
