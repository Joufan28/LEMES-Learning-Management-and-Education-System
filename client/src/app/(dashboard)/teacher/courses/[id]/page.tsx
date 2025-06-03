"use client";

import { CustomFormField } from "@/components/CustomFormField";
import DroppableComponent from "@/app/(dashboard)/teacher/courses/[id]/Droppable";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { Section, Chapter, CourseFormData, Course } from "@/lib/schemas";
import { centsToDollars, createCourseFormData } from "@/lib/utils";
import { openSectionModal, setSections } from "@/state";
import { useGetCourseQuery, useUpdateCourseMutation } from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";
import { courseSchema } from "@/lib/schemas";

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: courseData, isLoading, refetch } = useGetCourseQuery(id);
  const [updatedCourse] = useUpdateCourseMutation();

  console.log("Course ID:", id);
  console.log("Course Data:", courseData);
  console.log("Is Loading:", isLoading);

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const methods = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
      sections: [],
      image: "",
    },
  });

  useEffect(() => {
    console.log("Effect triggered with course data:", courseData);
    if (courseData?.data && !isLoading) {
      const course: Course = courseData.data;
      console.log("Resetting form with course data:", {
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        status: course.status,
        sections: course.sections,
        image: course.image,
      });
      
      methods.reset({
        courseTitle: course.title || "",
        courseDescription: course.description || "",
        courseCategory: course.category || "",
        coursePrice: centsToDollars(course.price || 0).toString(),
        sections: Array.isArray(course.sections) ? course.sections : [],
        courseStatus: course.status === "Published",
        image: course.image || "",
      });
      
      if (course.sections) {
        console.log("Setting sections:", course.sections);
        dispatch(setSections(course.sections));
      }
    }
  }, [courseData, isLoading, methods, dispatch]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      const formData = createCourseFormData(data, sections);
      
      await updatedCourse({
        courseId: id,
        formData,
      }).unwrap();

      await refetch();
      
      router.push("/teacher/courses");
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat data kursus...</div>;
  }

  if (!courseData?.data) {
    return <div className="flex items-center justify-center min-h-screen">Kursus tidak ditemukan</div>;
  }

  return (
    <div>
      {" "}
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2 cursor-pointer hover:bg-customgreys-dirtyGrey hover:text-white-100 text-customgreys-dirtyGrey"
          onClick={() => router.push("/teacher/courses", { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
      </div>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Header
            title="Course Setup"
            subtitle="Complete all fields and save your course"
            rightElement={
              <div className="flex items-center space-x-4">
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch("courseStatus") ? "Published" : "Draft"}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${methods.watch("courseStatus") ? "text-green-500" : "text-yellow-500"}`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                <Button type="submit" className="bg-primary-700 hover:bg-primary-600">
                  {methods.watch("courseStatus") ? "Update Published Course" : "Save Draft"}
                </Button>
              </div>
            }
          />

          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4">
                <CustomFormField name="courseTitle" label="Course Title" type="text" placeholder="Write course title here" className="border-none" />

                <CustomFormField name="courseDescription" label="Course Description" type="textarea" placeholder="Write course description here" />

                <CustomFormField
                  name="courseCategory"
                  label="Course Category"
                  type="select"
                  placeholder="Select category here"
                  options={[
                    { value: "web-development", label: "Web Development" },
                    { value: "data-science", label: "Data Science" },
                    { value: "machine-learning", label: "Machine Learning" },
                    { value: "react", label: "React" },
                    { value: "python", label: "Python" },
                    { value: "business", label: "Business" },
                    { value: "design", label: "Design" },
                    { value: "marketing", label: "Marketing" },
                    { value: "mobile-development", label: "Mobile Development" },
                    { value: "ui-ux", label: "UI/UX" },
                    { value: "finance", label: "Finance" },
                    { value: "photography", label: "Photography" },
                    { value: "music", label: "Music" },
                    { value: "language", label: "Language" },
                    { value: "health", label: "Health" },
                    { value: "personal-development", label: "Personal Development" },
                  ]}
                />

                <CustomFormField name="coursePrice" label="Course Price" type="number" placeholder="0" />

                <CustomFormField
                  name="image"
                  label="Course Thumbnail"
                  type="file"
                  accept="image/*"
                />

              </div>
            </div>

            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-secondary-foreground">Sections</h2>

                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => dispatch(openSectionModal({ sectionIndex: null }))} 
                  className="border-none text-primary-700 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-primary-700 group-hover:white-100" />
                  <span className="text-primary-700 group-hover:white-100">Add Section</span>
                </Button>
              </div>

              {isLoading ? (
                <p>Loading course content...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p>No sections available</p>
              )}

            </div>
          </div>
        </form>
      </Form>
      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
