"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useCreateStripePaymentIntentMutation } from "@/state/api";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useCreateTransactionMutation } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import CoursePreview from "@/components/CoursePreview";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/schemas";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0570de",
    colorBackground: "#18181b",
    colorText: "#d2d2d2",
    colorDanger: "#df1b41",
    colorTextPlaceholder: "#2f2b2b",
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "3px",
    borderRadius: "10px",
    fontSizeBase: "14px",
  },
};

const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSecret, setClientSecret] = useState<string | "">("");
  const [createStripePaymentIntent] = useCreateStripePaymentIntentMutation();
  const { course } = useCurrentCourse();

  useEffect(() => {
    if (!course) return;
    console.log("Fetched course object:", course);
    const fetchPaymentIntent = async () => {
      try {
        const result = await createStripePaymentIntent({
          amount: course?.data?.price ?? 50,
        }).unwrap();

        setClientSecret(result.clientSecret);
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        toast.error("Failed to initialize payment. Please try again.");
      }
    };

    fetchPaymentIntent();
  }, [createStripePaymentIntent, course?.data?.price, course]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  console.log("StripeProvider Client Secret:", clientSecret);

  if (!clientSecret) return <Loading />;

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      {children}
    </Elements>
  );
};

const PaymentPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [createTransaction] = useCreateTransactionMutation();
  const { navigateToStep } = useCheckoutNavigation();
  const { course, courseId } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  console.log("PaymentPageContent - Course Data:", course);
  console.log("PaymentPageContent - course?.data:", course?.data);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe service is not available");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL ? `${process.env.NEXT_PUBLIC_LOCAL_URL}` : process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined;

    console.log(baseUrl);
    if (!baseUrl) {
      toast.error("App URL is not configured. Please set NEXT_PUBLIC_LOCAL_URL or NEXT_PUBLIC_VERCEL_URL.");
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/checkout?step=3&id=${courseId}`,
      },
      redirect: "if_required",
    });

    if (result.paymentIntent?.status === "succeeded") {
      const transactionData: Partial<Transaction> = {
        transactionId: result.paymentIntent.id,
        userId: user?.id,
        courseId: courseId,
        paymentProvider: "stripe",
        amount: course?.data?.price || 0,
      };

      await createTransaction(transactionData);
      navigateToStep(3);
    } else if (result.error) {
      toast.error(result.error.message || "Payment confirmation failed.");
    }
  };

  const handleSignOutAndNavigate = async () => {
    await signOut();
    navigateToStep(1);
  };

  if (!course?.data) return <Loading />;

  return (
    <div className="payment">
      <div className="payment__container">
        <div className="payment__preview">
          <CoursePreview course={course?.data} />
        </div>

        <div className="payment__form-container">
          <form id="payment-form" onSubmit={handleSubmit} className="border border-blue-200 payment__form">
            <div className="payment__content">
              <h1 className="payment__title">Checkout</h1>
              <p className="payment__subtitle">Fill out the payment details below to complete your purchase.</p>

              <div className="payment__method">
                <h3 className="payment__method-title">Payment Method</h3>

                <div className="payment__card-container">
                  <div className="payment__card-header">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
          </form>
          {/* Navigation Buttons */}
          <div className="payment__actions flex justify-between items-center">
            <Button className="hover:bg-white-50/10" onClick={handleSignOutAndNavigate} variant="outline" type="button">
              Switch Account
            </Button>

            <Button form="payment-form" type="submit" className="payment__submit" disabled={!stripe || !elements}>
              Pay with Credit Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => (
  <StripeProvider>
    <PaymentPageContent />
  </StripeProvider>
);

export default PaymentPage;
