import { logoutAction } from "@/lib/admin/actions";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-heading text-foreground">SillettiX Admin</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="focus-ring rounded-sm text-sm text-foreground-muted hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-4 text-body-md text-foreground-muted">
        Sections, theme, and SEO management are coming next.
      </p>
    </div>
  );
}
