import type { Metadata } from "next";
import { IPhoneSimulator } from "@/components/preview/iphone-simulator";

export const metadata: Metadata = {
  title: "iPhone 17 Pro Max Simulator · Tradelog",
  description: "Interactive movable iPhone 17 Pro Max mobile studio preview for Tradelog.",
};

export default function PreviewPage() {
  return <IPhoneSimulator />;
}
