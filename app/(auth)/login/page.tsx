import { redirectIfAuthenticated } from "@/lib/auth/serverAuth";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await redirectIfAuthenticated("/dashboard");
  return <LoginClient />;
}
