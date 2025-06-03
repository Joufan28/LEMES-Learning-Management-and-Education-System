import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useCreateStripePaymentIntentMutation } from "@/state/api";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import Loading from "@/components/Loading";
import { toast } from "sonner";

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

interface StripeProviderProps {
    children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
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

export default StripeProvider; 