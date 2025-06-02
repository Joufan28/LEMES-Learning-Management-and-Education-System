import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

// Define Course interface locally for now
interface Course {
  courseId: string;
  teacherId: string;
  teacherName: string;
  teacherBio?: string;
  teacherJob?: string;
  teacherImageUrl?: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  price: number;
  level: string;
  status: "Published" | "Draft";
  sections: any[]; // Use any for simplicity for now
  enrollments: any[]; // Use any for simplicity for now
  createdAt: string;
  updatedAt: string;
}

interface TeacherCourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  isOwner: boolean;
  onViewCourse: (course: Course) => void;
}

const TeacherCourseCard: React.FC<TeacherCourseCardProps> = ({
  course,
  onEdit,
  onDelete,
  isOwner,
  onViewCourse,
}) => {
  const imageUrl = course.image || "/placeholder.png";
  const statusColor = course.status === "Published" ? "bg-green-500" : "bg-yellow-500";

  return (
    <Card className="teacher-course-card w-full max-w-sm rounded-lg overflow-hidden shadow-lg bg-customgreys-secondarybg border-slate-500">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={course.title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold mb-2 text-white-100">{course.title}</CardTitle>
        <CardDescription className="text-sm text-gray-400 mb-2">{course.category}</CardDescription>
        <div className="flex items-center mb-2">
          <span className={cn("px-2 py-1 text-xs font-semibold text-white rounded-full", statusColor)}>{course.status}</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">{course.enrollments?.length || 0} Students Enrolled</p>

        <div className="flex justify-between items-center">
          {isOwner && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewCourse(course)} className="text-blue-500 border-blue-500 hover:bg-customgreys-primarybg/70 hover:text-white">
                View Your Course
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(course)} className="text-yellow-500 border-yellow-500 hover:bg-customgreys-primarybg/70 hover:text-white">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(course.courseId)} className="text-red-500 border-red-500 hover:bg-customgreys-primarybg/70 hover:text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;
