import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    redirect(`/u/${profile.username}`);
  } else {
    // Fallback if username is missing (sidebar/layout might handle this, or force setup)
    redirect("/profile/edit");
  }
} 