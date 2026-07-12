import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

/**
 * Every mutating Server Action must call this first. proxy.ts gates page
 * navigation, but Next's own docs warn Proxy shouldn't be the only line of
 * defense for Server Actions/Route Handlers — they can be invoked directly.
 */
export async function requireAdminSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const valid = token ? await verifySessionToken(token) : false;
  if (!valid) {
    throw new Error("Unauthorized");
  }
}
