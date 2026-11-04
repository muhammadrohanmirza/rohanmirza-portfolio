"use server";

import { loginWithCredentials, logoutAdmin } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: { email: string; password: string }) {
  // 1. Validate inputs
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const parsed = LoginSchema.safeParse(formData);
  if (!parsed.success) {
    console.warn(`[AUTH DEBUG] Login rejected: Invalid input format from IP "${ip}". Errors:`, parsed.error.flatten().fieldErrors);
    return {
      success: false,
      error: "Please enter a valid email address and password.",
    };
  }

  // 2. IP Rate Limiting (Max 5 attempts / 15 minutes)
  const rateLimit = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    console.warn(
      `[AUTH DEBUG] Login blocked: Rate limit exceeded for IP "${ip}". Exceeded 5 attempts per 15 minutes. Unlocks at ${new Date(Date.now() + rateLimit.resetTimeMs).toLocaleTimeString()}.`
    );
    return {
      success: false,
      error: "Too many failed sign-in attempts. Please wait 15 minutes before trying again.",
    };
  }

  // 3. Attempt authentication
  const result = await loginWithCredentials(parsed.data.email, parsed.data.password);
  return result;
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/login");
}
