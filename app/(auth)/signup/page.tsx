import { redirectIfAuthenticated } from "@/lib/auth/serverAuth";
import { SignupClient } from "./SignupClient";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  await redirectIfAuthenticated("/dashboard");
  return <SignupClient />;
}
