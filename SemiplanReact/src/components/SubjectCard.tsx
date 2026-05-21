
import { Calendar, Clock3, BookOpen } from "lucide-react";
import type { Subject } from "../pages/Subjects";

interface Props {
  subject: Subject;
}

export default function SubjectCard({ subject }: Props) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-md
        hover:shadow-2xl
        transition-all
        hover:-translate-y-1
        p-5
        cursor-pointer
      "
    >
      {/* top color */}
      <div
        className="h-2 rounded-full mb-4"
        style={{ backgroundColor: subject.color }}
      />

      {/* code */}
      <p className="text-sm text-gray-400">
        SUBJECT
      </p>

      {/* title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {subject.title}
      </h2>

      {/* progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-500">
            Progress
          </span>

          <span className="font-semibold text-blue-700">
            {subject.progress}%
          </span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${subject.progress}%`,
              backgroundColor: subject.color,
            }}
          />
        </div>
      </div>

      {/* stats */}
      <div className="flex gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>
            {subject.examDate}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Clock3 size={16} />
          <span>
            {subject.estimatedHours}h
          </span>
        </div>

        <div className="flex items-center gap-1">
          <BookOpen size={16} />
          <span>
            {subject.chapterCount} ch
          </span>
        </div>
      </div>

      {/* completed */}
      <p className="text-sm text-gray-400">
        {subject.completedHours}/
        {subject.estimatedHours}h completed
      </p>
    </div>
  );
}