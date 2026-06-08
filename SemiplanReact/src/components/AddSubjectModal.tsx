import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, BookOpen, Calendar, Hash } from 'lucide-react'

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  userId: number;
}

export default function AddSubjectModal({ isOpen, onClose, onSubmit, userId }: AddSubjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 3,
    color: '#6366f1',
    examDate: '',
    estimatedStudyHours: 0,
    status: 1 // 1 = Active
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        userId: userId,
        examDate: new Date(formData.examDate).toISOString()
      });
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 3,
        color: '#6366f1',
        examDate: '',
        estimatedStudyHours: 0,
        status: 1
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-600" />
            </div>
            Create New Subject
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              placeholder="e.g. Advanced Mathematics"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              placeholder="What is this subject about?"
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Exam Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Exam Date
              </label>
              <input
                type="date"
                required
                value={formData.examDate}
                onChange={e => setFormData({...formData, examDate: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400" /> Difficulty Level
              </span>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{formData.difficulty}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={e => setFormData({...formData, difficulty: parseInt(e.target.value)})}
              className="w-full accent-primary-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Theme Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-8 h-8 rounded-full transition-transform ${formData.color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
