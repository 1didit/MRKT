import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { getSessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/admin/login");
  return (
    <>
      <AdminShell userEmail={user.email}>{children}</AdminShell>
      <Toaster richColors position="top-center" />
    </>
  );
}
