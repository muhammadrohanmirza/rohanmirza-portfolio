import React from "react";
import { getAdminMessages } from "@/lib/queries/admin.queries";
import { MessagesManager } from "./MessagesManager";
import { Mail } from "lucide-react";

export const instant = false;

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Contact Messages & Inquiries
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real visitor submissions received via the public contact channel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MessagesManager initialMessages={messages} />
    </div>
  );
}
