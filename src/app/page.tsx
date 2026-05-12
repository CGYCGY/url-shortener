import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { user } = await withAuth();
  redirect(user ? "/dashboard" : "/login");
}
