import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY os required but was not found in env variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const listTransactions = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  try {
    const transactions = userId ? await Transaction.query("userId").eq(userId).exec() : await Transaction.scan().exec();

    res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};

export const createStripePaymentIntent = async (req: Request, res: Response): Promise<void> => {
  let { amount } = req.body;

  if (!amount || amount <= 0) {
    amount = 50;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating stripe payment intent", error });
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;
  console.log("Creating transaction with data:", { userId, courseId, transactionId, amount, paymentProvider });

  try {
    // 1. get course info
    console.log("Fetching course info for courseId:", courseId);
    const course = await Course.get(courseId);
    console.log("Course info:", course);

    if (!course) {
      console.error("Course not found:", courseId);
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // 2. create transaction record
    console.log("Creating transaction record...");
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();
    console.log("Transaction record created:", newTransaction);

    // 3. create initial course progress
    console.log("Creating initial course progress...");
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    await initialProgress.save();
    console.log("Initial course progress created:", initialProgress);

    // 4. add enrollment to relevant course
    console.log("Adding user to course enrollments...");
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    );
    console.log("User added to course enrollments");

    res.json({
      message: "Purchased Course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    console.error("Error in createTransaction:", error);
    res.status(500).json({ message: "Error creating transaction and enrollment", error });
  }
};
