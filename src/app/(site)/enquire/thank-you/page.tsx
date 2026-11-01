import type { Metadata } from "next";
import { ThankYou } from "@/features/enquiries/presentation/enquiry-form";

export const metadata: Metadata = {
  title: "Enquiry received",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className="tg-wrap tg-section">
      <ThankYou />
    </div>
  );
}
