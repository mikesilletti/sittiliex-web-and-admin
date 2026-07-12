import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background-raised p-8">
        <h1 className="text-display-sm font-heading text-foreground">Sign in</h1>
        <p className="mt-2 text-body-sm text-foreground-muted">
          Enter the admin password to manage SillettiX.
        </p>
        <LoginForm from={from ?? "/admin"} />
      </div>
    </div>
  );
}
