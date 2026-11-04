import { NextResponse } from "next/server";
import { ContactSubmissionSchema } from "@/lib/validations/message.schema";
import { checkRateLimit } from "@/lib/rate-limiter";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting (Generous for dev/localhost, 5/hr in production)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const isLocalhost = ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
    const limit = process.env.NODE_ENV === "development" || isLocalhost ? 60 : 5;
    const rateLimit = checkRateLimit(`contact:${ip}`, limit, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many messages sent. Please wait before trying again.",
        },
        { status: 429 }
      );
    }

    // 2. Parse Body & Honeypot Check
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    // Honeypot check: If bot filled the website field, silently succeed without storing or alerting bot
    if (body.website && typeof body.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Thank you! Your message has been received." },
        { status: 201 }
      );
    }

    const validated = ContactSubmissionSchema.safeParse(body);
    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || "Please check your inputs and try again.";
      console.warn("[CONTACT VALIDATION ERROR]", fieldErrors);
      return NextResponse.json(
        {
          success: false,
          error: firstErrorMessage,
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validated.data;

    // 3. Persist to Neon PostgreSQL
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
        isRead: false,
        ipHash: null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    try {
      revalidatePath("/admin/messages");
      revalidatePath("/admin");
    } catch {
      // Cache revalidation optional / store missing in certain runtime contexts
    }

    // 5. Send server-side notification email via Resend
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey || resendApiKey.trim() === "") {
        console.log(
          "[CONTACT RESEND NOTICE] RESEND_API_KEY is not configured. Email notification skipped; message stored in database."
        );
      } else {
        const resend = new Resend(resendApiKey);
        const toEmail = process.env.CONTACT_TO_EMAIL || "contact@rohan.dev";
        const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject || "Portfolio Inquiry");
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: toEmail,
          replyTo: email,
          subject: `[Rohan.Dev Portfolio] New Inquiry: ${safeSubject}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0e1017; color: #f1f5f9; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h2 style="margin-top: 0; color: #06b6d4; font-size: 20px;">New Portfolio Contact Message</h2>
              <div style="background: #141622; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid rgba(255,255,255,0.06);">
                <p style="margin: 6px 0;"><strong>From:</strong> ${safeName} &lt;<a href="mailto:${safeEmail}" style="color: #38bdf8;">${safeEmail}</a>&gt;</p>
                <p style="margin: 6px 0;"><strong>Subject:</strong> ${safeSubject}</p>
                <p style="margin: 6px 0;"><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
              </div>
              <h3 style="color: #94a3b8; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">Message Content:</h3>
              <div style="background: #090a0f; padding: 16px; border-radius: 8px; line-height: 1.6; border: 1px solid rgba(255,255,255,0.06); font-size: 14px;">
                ${safeMessage}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
                Sent via Rohan.Dev portfolio contact engine • Hit 'Reply' to respond directly to ${safeName}.
              </p>
            </div>
          `,
        });

        if (error) {
          console.error("[CONTACT RESEND ERROR] Failed to deliver email notification:", error);
        } else {
          console.log(`[CONTACT RESEND SUCCESS] Notification email sent successfully. ID: ${data?.id}`);
        }
      }
    } catch (resendError) {
      console.error("[CONTACT RESEND EXCEPTION] Unexpected error during email dispatch:", resendError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your message has been received.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
