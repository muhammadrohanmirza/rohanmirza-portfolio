"use client";

import React, { useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  FileText,
  Edit2,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import { deleteMediaAsset } from "@/lib/actions/media.actions";

export interface ImageUploaderProps {
  value?: string | null;
  onImageAdded?: (url: string, altText?: string) => void;
  onImageChange?: (url: string) => void;
  folder?: string;
  label?: string;
  acceptPdf?: boolean;
}

export function ImageUploader({
  value,
  onImageAdded,
  onImageChange,
  folder = "portfolio/projects",
  label = "Image",
  acceptPdf = false,
}: ImageUploaderProps) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [directUrl, setDirectUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Normalize current value
  const currentValue = (value ?? "").trim();
  const hasValue = Boolean(currentValue);
  const isPdf =
    currentValue.toLowerCase().endsWith(".pdf") ||
    currentValue.includes("/resumes/") ||
    currentValue.includes("raw/upload");

  const handleCommitAsset = async (newUrl: string, itemAlt?: string) => {
    const trimmedNew = newUrl.trim();
    const oldUrl = currentValue;

    // Call update callbacks
    if (onImageChange) {
      onImageChange(trimmedNew);
    }
    if (onImageAdded) {
      onImageAdded(trimmedNew, itemAlt);
    }

    // Server-side cleanup of previous Cloudinary asset if replaced
    if (oldUrl && oldUrl !== trimmedNew && oldUrl.includes("res.cloudinary.com")) {
      deleteMediaAsset(oldUrl).catch((err) => {
        console.error("Non-blocking Cloudinary deletion error on replace:", err);
      });
    }

    setIsReplacing(false);
    setShowConfirmRemove(false);
    setDirectUrl("");
    setAltText("");
    setImageError(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds maximum allowed size of 10MB.");
      return;
    }

    const isFilePdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isFilePdf && !acceptPdf) {
      setErrorMessage("PDF documents are not supported for this image field.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      // Route PDFs to resume endpoint and images to image endpoint
      const endpoint = isFilePdf ? "/api/uploads/resume" : "/api/uploads/image";
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        await handleCommitAsset(data.url, altText || file.name);
      } else {
        setErrorMessage(
          data.error ||
            "Upload failed. Please try entering a Direct Image URL instead."
        );
        setTab("url");
      }
    } catch {
      setErrorMessage(
        "Error uploading file. Please try entering a Direct Image URL instead."
      );
      setTab("url");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = directUrl.trim();
    if (!url) return;

    // Auto-convert Unsplash page URLs into direct CDN URLs
    const unsplashMatch = url.match(
      /^https?:\/\/(?:www\.)?unsplash\.com\/photos\/(?:[\w-]+-)?([a-zA-Z0-9_-]+)/
    );
    if (unsplashMatch && unsplashMatch[1]) {
      url = `https://images.unsplash.com/photo-${unsplashMatch[1]}?auto=format&fit=crop&w=1200&q=80`;
    }

    await handleCommitAsset(url, altText || "Image preview");
  };

  const handleConfirmRemove = async () => {
    const oldUrl = currentValue;
    setShowConfirmRemove(false);

    if (onImageChange) {
      onImageChange("");
    }
    if (onImageAdded) {
      onImageAdded("");
    }

    // Server-side cleanup of Cloudinary asset after session validation
    if (oldUrl && oldUrl.includes("res.cloudinary.com")) {
      deleteMediaAsset(oldUrl).catch((err) => {
        console.error("Non-blocking Cloudinary deletion error on remove:", err);
      });
    }

    setIsReplacing(false);
  };

  const handleStartEditUrl = () => {
    setDirectUrl(currentValue);
    setTab("url");
    setIsReplacing(true);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#090a0f] border border-white/10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
          {label}
        </span>

        {(!hasValue || isReplacing) && (
          <div className="flex items-center gap-1 bg-[#12131a] p-1 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                tab === "file"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                tab === "url"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Direct URL
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. If an image is set and NOT in replace mode: show preview with Replace & Remove actions */}
      {hasValue && !isReplacing ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-[#12131a] border border-white/10">
            {/* Thumbnail preview */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
              {isPdf ? (
                <div className="flex flex-col items-center justify-center text-cyan-400 gap-1.5 p-2 text-center">
                  <FileText className="w-8 h-8" />
                  <span className="text-[10px] font-mono uppercase text-slate-300">
                    PDF File
                  </span>
                </div>
              ) : !imageError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentValue}
                  alt="Asset Preview"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-1 p-2 text-center">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  <span className="text-[9px] font-mono text-slate-400">
                    Broken URL
                  </span>
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="flex-1 min-w-0 w-full space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 truncate max-w-xs sm:max-w-md block">
                  {currentValue}
                </span>
                <a
                  href={currentValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white shrink-0 p-1 rounded hover:bg-white/5"
                  title="Open asset in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Replace Action */}
                <button
                  type="button"
                  onClick={() => {
                    setIsReplacing(true);
                    setDirectUrl("");
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-mono border border-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Replace</span>
                </button>

                {/* Edit URL Action */}
                <button
                  type="button"
                  onClick={handleStartEditUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-mono border border-white/10 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit URL</span>
                </button>

                {/* Remove Action with Confirmation */}
                {!showConfirmRemove ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmRemove(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/50">
                    <span className="text-[11px] font-mono text-rose-300 pl-1">
                      Confirm remove?
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmRemove}
                      className="px-2.5 py-1.5 min-h-[36px] rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold transition-colors cursor-pointer"
                    >
                      Yes, Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmRemove(false)}
                      className="px-2 py-1.5 min-h-[36px] rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Upload Dropzone / Direct URL input (when empty or when Replacing) */
        <div className="space-y-3">
          {isReplacing && (
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono text-cyan-400">
                Selecting replacement asset:
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsReplacing(false);
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 min-h-[36px]"
              >
                <X className="w-3.5 h-3.5" /> Cancel Replace
              </button>
            </div>
          )}

          {tab === "file" ? (
            <div className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                id={`file-upload-input-${label.replace(/\s+/g, "-")}`}
                accept={
                  acceptPdf
                    ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
                    : "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                }
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor={`file-upload-input-${label.replace(/\s+/g, "-")}`}
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                </div>
                <p className="text-[11px] font-mono text-slate-500">
                  {acceptPdf
                    ? "PNG, JPG, WebP, SVG or PDF up to 10MB"
                    : "PNG, JPG, WebP, SVG, AVIF up to 10MB"}
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="url"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleDirectUrlSubmit();
                      }
                    }}
                    placeholder={
                      acceptPdf
                        ? "https://... (.pdf or image URL)"
                        : "https://images.unsplash.com/... or https://..."
                    }
                    className="w-full bg-[#12131a] border border-white/10 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDirectUrlSubmit()}
                  disabled={!directUrl.trim()}
                  className="px-4 py-2 min-h-[38px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isReplacing ? "Set URL" : "Add URL"}
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Paste any direct image or file CDN URL.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
