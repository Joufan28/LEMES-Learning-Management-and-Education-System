import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TeacherCourseCardProps {
  course: {
    courseId: string;
    title: string;
    category: string;
    status: "Published" | "Draft";
    enrollments?: any[];
    image?: string;
    teacherId: string;
  };
  onEdit: (course: any) => void;
  onDelete: (course: any) => void;
  isOwner: boolean;
}

const TeacherCourseCard = React.memo(
  ({ course, onEdit, onDelete, isOwner }: TeacherCourseCardProps) => {
    return (
      <Card className="course-card-teacher group">
        <CardHeader className="course-card-teacher__header p-0 relative">
          <Image src={course.image || "/placeholder.png"} alt={course.title} width={370} height={150} className="course-card-teacher__image rounded-t-lg" priority />
        </CardHeader>

        <CardContent className="course-card-teacher__content p-4">
          <div className="flex flex-col mb-3">
            <CardTitle className="course-card-teacher__title text-lg font-bold mb-1">{course.title}</CardTitle>

            <CardDescription className="course-card-teacher__category text-sm text-gray-400 mb-2">{course.category}</CardDescription>

            <div className="flex items-center mb-2">
              <span className="text-sm mr-2">Status:</span>
              <span className={cn("font-semibold px-2 py-1 rounded text-xs", course.status === "Published" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>{course.status}</span>
            </div>

            {course.enrollments && course.enrollments.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                <span className="font-medium text-gray-200">{course.enrollments.length}</span> Student{course.enrollments.length !== 1 ? "s" : ""} Enrolled
              </p>
            )}
          </div>

          <div className="w-full flex flex-col sm:flex-row sm:space-y-0 gap-2 mt-auto">
            {isOwner ? (
              <>
                <Button variant="outline" className="course-card-teacher__edit-button flex-1" onClick={() => onEdit(course)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" className="course-card-teacher__delete-button flex-1" onClick={() => onDelete(course)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic text-center w-full py-2">View Only</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
  // Custom comparison function untuk mencegah re-render tidak perlu
  (prevProps, nextProps) => {
    return prevProps.course.courseId === nextProps.course.courseId && prevProps.isOwner === nextProps.isOwner;
  }
);

TeacherCourseCard.displayName = "TeacherCourseCard";

export default TeacherCourseCard;
