import { redirect } from "next/navigation";

// This page exists to handle direct access to / 
// It redirects to the default locale
export default function RootPage() {
  redirect("/en");
}
