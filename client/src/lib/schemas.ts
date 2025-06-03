import * as z from "zod";

// Course Editor Schemas
export const courseSchema = z.object({
  courseTitle: z.string().min(1, "Judul kursus diperlukan"),
  courseDescription: z.string().optional(),
  courseCategory: z.string().min(1, "Kategori diperlukan"),
  coursePrice: z.string(),
  courseStatus: z.boolean(),
  image: z.union([z.string(), z.instanceof(File)]).optional(),
  sections: z.array(z.object({
    sectionId: z.string(),
    sectionTitle: z.string(),
    sectionDescription: z.string().optional(),
    chapters: z.array(z.object({
      chapterId: z.string(),
      title: z.string(),
      content: z.string(),
      video: z.union([z.string(), z.instanceof(File)]).optional(),
      quizQuestions: z.array(z.string()).optional(),
      resourceLinks: z.array(z.string()).optional(),
    })).default([]),
  })).default([]),
});

// Explicitly define CourseFormData to ensure correct type for sections and chapters
export interface CourseFormData {
  courseTitle: string;
  courseDescription?: string;
  courseCategory: string;
  coursePrice: string;
  courseStatus: boolean;
  image?: string | File;
  sections: Array<{
    sectionId: string;
    sectionTitle: string;
    sectionDescription?: string;
    chapters: Array<{
      chapterId: string;
      title: string;
      content: string;
      video?: string | File;
      quizQuestions?: string[];
      resourceLinks?: string[];
    }>;
  }>;
}

// Chapter Schemas
export const chapterSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  video: z.union([z.string(), z.instanceof(File)]).optional(),
  quizQuestions: z.array(z.string()).optional(),
  resourceLinks: z.array(z.string()).optional(),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;

// Define the full Chapter type including non-form fields
export interface Chapter {
  chapterId: string;
  type: "Text" | "Quiz" | "Video";
  title: string;
  content: string;
  comments?: any[];
  video?: string | File;
  videoFile?: { name: string; type: string; size: number };
  quizQuestions?: string[];
  resourceLinks?: string[];
}

// Define ChapterProgress type
export interface ChapterProgress {
  chapterId: string;
  completed: boolean;
}

// Section Schemas
export const sectionSchema = z.object({
  sectionId: z.string(),
  sectionTitle: z.string().min(2, "Section title must be at least 2 characters"),
  sectionDescription: z.string().optional(),
  chapters: z.array(z.object({
    title: z.string(),
    content: z.string(),
    video: z.union([z.string(), z.instanceof(File)]).optional(),
    quizQuestions: z.array(z.string()).optional(),
    resourceLinks: z.array(z.string()).optional(),
  })),
});

// Explicitly define SectionFormData to ensure chapters is a required array
export interface SectionFormData {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  chapters: Array<{
    title: string;
    content: string;
    video?: string | File;
    quizQuestions?: string[];
    resourceLinks?: string[];
  }>;
}

// Define the full Section type
export interface Section {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  chapters: Chapter[];
}

// Guest Checkout Schema
export const guestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  courseNotifications: z.boolean(),
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;

export interface Course {
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
  sections: Section[];
  enrollments: { userId: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  userId: string;
  transactionId: string;
  dateTime: string;
  courseId: string;
  paymentProvider: "stripe";
  paymentMethodId?: string;
  amount: number; // Stored in cents
  savePaymentMethod?: boolean;
}

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  sections: Array<{
    sectionId: string;
    chapters: Array<{
      chapterId: string;
      completed: boolean;
    }>;
  }>;
}
