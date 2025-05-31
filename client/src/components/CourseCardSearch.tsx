import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface SearchCourseCardProps {
  course: any;
  isSelected?: boolean;
  onClick: () => void;
  darkMode?: boolean;
}

const CourseCardSearch = ({ course, isSelected, onClick, darkMode = true }: SearchCourseCardProps) => {
  // Fungsi untuk mendapatkan warna badge berdasarkan level
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return { bg: "bg-green-900/30", text: "text-green-400", border: "border-green-500/30" };
      case "intermediate":
        return { bg: "bg-blue-900/30", text: "text-blue-400", border: "border-blue-500/30" };
      case "advanced":
        return { bg: "bg-purple-900/30", text: "text-purple-400", border: "border-purple-500/30" };
      default:
        return { bg: "bg-gray-700", text: "text-gray-300", border: "border-gray-600" };
    }
  };

  const levelColors = getLevelColor(course.level || "Beginner");

  return (
    <div
      onClick={onClick}
      className={`group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
        ${isSelected ? "ring-2 ring-blue-500" : ""}
        ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500" : "bg-white border border-gray-200"}
      `}
    >
      <div className="relative h-48 overflow-hidden">
        <Image src={course.image || "/placeholder.png"} alt={course.title} sizes="(max-width: 768px)100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" fill />
        <div className="absolute bottom-3 right-3">
          <span className={`${levelColors.bg} ${levelColors.text} ${levelColors.border} text-xs font-medium px-2.5 py-1 rounded-full border`}>{course.level || "Beginner"}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`font-bold text-lg line-clamp-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{course.title}</h2>
        </div>

        <p className={`text-sm mb-4 h-14 overflow-hidden ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{course.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{course.teacherName?.charAt(0) || "T"}</div>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>By {course.teacherName || "Unknown Teacher"}</p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <span className={`font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>{formatPrice(course.price)}</span>
            {course.originalPrice && <span className={`text-xs line-through ml-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{formatPrice(course.originalPrice)}</span>}
          </div>

          <div className="flex items-center">
            <svg className={`w-4 h-4 mr-1 ${darkMode ? "text-yellow-400" : "text-yellow-500"}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {course.rating || "4.8"} ({course.reviews || "120"})
            </span>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div className={`text-sm px-3 py-1 rounded-full ${darkMode ? "bg-blue-900/20 text-blue-300" : "bg-blue-100 text-blue-700"}`}>{course.enrollments?.length || 0} Enrolled</div>
          <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{course.duration || "8h 30m"}</div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSearch;
