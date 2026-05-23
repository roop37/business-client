import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SelectHostClient } from "./SelectHostClient";

export const dynamic = "force-dynamic";

export default function SelectHostPage() {
  const cookieStore = cookies();
  if (!cookieStore.get("accessToken")?.value) {
    redirect("/login");
  }
  return <SelectHostClient />;
}
