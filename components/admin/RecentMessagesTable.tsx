"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RecentMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface RecentMessagesTableProps {
  messages: RecentMessageItem[];
  totalMessagesCount: number;
}

export function RecentMessagesTable({
  messages,
  totalMessagesCount,
}: RecentMessagesTableProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-100">
      {/* Header with Title, Tabs, and View All link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Recent Inquiries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest communications submitted by visitors.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Small text tabs (All / Unread / Read) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === "read"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Read
            </button>
          </div>

          <Link
            href="/admin/messages"
            className="text-xs font-semibold text-[#3498db] hover:text-[#2980b9] inline-flex items-center gap-1 transition-colors"
          >
            <span>View all ({totalMessagesCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table Content */}
      {filteredMessages.length > 0 ? (
        <div className="overflow-x-auto touch-scroll-x mt-2 -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 rounded-l-xl">Sender</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMessages.map((msg) => (
                <tr
                  key={msg.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    <div className="font-semibold">{msg.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{msg.email}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-medium text-slate-700 truncate">
                      {msg.subject || "No subject provided"}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate max-w-sm">
                      {msg.message}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {!msg.isRead ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#f97316] border border-orange-200">
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                        Read
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {formatDate(msg.createdAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href="/admin/messages"
                      className="text-[#3498db] hover:text-[#2980b9] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">
          <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No messages found</p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === "all"
              ? "When visitors submit inquiries through your portfolio contact channel, they will appear here."
              : `No ${filter} messages available in this view.`}
          </p>
        </div>
      )}
    </div>
  );
}
