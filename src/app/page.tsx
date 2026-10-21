import { redirect } from "next/navigation";

/** Aplikasi pribadi: halaman depan langsung ke dashboard, tanpa landing page. */
export default function RootPage() {
  redirect("/dashboard");
}
