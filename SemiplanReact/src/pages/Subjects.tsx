
import { useEffect, useState } from "react";
import { getSubjects } from "../api/api";
import SubjectCard from "../components/SubjectCard";
export interface Subject {
    id: string;
    title: string;
    difficulty: number;
    progress: number;
    examDate: string;
    estimatedHours: number;
    completedHours: number;
    chapterCount: number;
    color: string;
}
export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const data = await getSubjects();
                setSubjects(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold">
                        Subjects
                    </h1>

                    <p className="text-gray-500">
                        Manage your courses
                    </p>
                </div>

                <button
                    className="
            bg-blue-900
            text-white
            px-5
            py-3
            rounded-xl
            hover:bg-blue-800
          "
                >
                    Add Subject
                </button>
            </div>

            {/* grid */}
            <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
      ">
                {subjects.map((subject) => (
                    <SubjectCard
                        key={subject.id}
                        subject={subject}
                    />
                ))}
            </div>
        </div>
    );
}