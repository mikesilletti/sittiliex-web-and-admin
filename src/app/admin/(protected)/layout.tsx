import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { ContactNotificationsProvider } from "@/components/admin/notifications/ContactNotifications";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const valid = token ? await verifySessionToken(token) : false;

  // Defense in depth alongside proxy.ts. This layout only wraps routes
  // inside the (protected) route group — /admin/login is a sibling outside
  // it, so it's never subject to this check (which would otherwise cause a
  // redirect loop).
  if (!valid) {
    redirect("/admin/login");
  }

  return (
    <ContactNotificationsProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AdminNav />
        {children}
      </div>
    </ContactNotificationsProvider>
  );
}
