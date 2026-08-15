import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";

export default async function DashboardIndex() {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  redirect(`/dashboard/${profile.role}`);
}
