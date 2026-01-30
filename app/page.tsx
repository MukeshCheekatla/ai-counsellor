import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "./actions/profile";
import HomePage from "@/components/HomePage";

export default async function Home() {
  // Check if user is logged in
  const session = await auth();

  if (session?.user?.id) {
    // User is logged in, check onboarding status
    const profile = await getUserProfile();

    if (!profile || !profile.onboardingComplete) {
      // Redirect to onboarding if not completed
      redirect("/onboarding");
    } else {
      // Redirect to dashboard if onboarding is complete
      redirect("/dashboard");
    }
  }

  // User is not logged in, show the landing page
  return <HomePage />;
}

