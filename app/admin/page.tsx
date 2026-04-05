"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ImageData {
  id: string;
  url: string;
  label: string | null;
  filename: string;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [images, setImages] = useState<ImageData[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Verify by attempting a protected request
    const res = await fetch("/api/images", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  async function loadImages() {
    setLoadingImages(true);
    const res = await fetch("/api/images", {
      headers: { "x-admin-password": password },
    });
    const data = await res.json();
    setImages(data);
    setLoadingImages(false);
  }

  useEffect(() => {
    if (authed) loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setUploadError("");
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("label", label.trim());

    const res = await fetch("/api/images", {
      method: "POST",
      headers: { "x-admin-password": password },
      body: fd,
    });

    if (res.ok) {
      setFile(null);
      setLabel("");
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadImages();
    } else {
      const data = await res.json();
      setUploadError(data.error ?? "Upload failed");
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    await fetch(`/api/images/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    await loadImages();
  }

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-6">Admin login</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
            />
            {authError && (
              <p className="text-red-500 text-sm">Incorrect password.</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin — Image Library</h1>
        <span className="text-sm text-gray-400">{images.length} image{images.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Upload form */}
      <section className="border border-gray-200 rounded-xl p-6">
        <h2 className="font-medium mb-4">Upload image</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <div
              className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 cursor-pointer flex items-center justify-center text-gray-400 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <Image src={preview} alt="Preview" width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <span>+ image</span>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-left text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2"
              >
                {file ? file.name : "Choose a file…"}
              </button>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

          <button
            type="submit"
            disabled={!file || uploading}
            className="self-start px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      {/* Image grid */}
      {loadingImages ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : images.length === 0 ? (
        <p className="text-gray-400 text-sm">No images yet. Upload one above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  src={img.url}
                  alt={img.label ?? img.filename}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Delete"
                >
                  ×
                </button>
              </div>
              {img.label && (
                <p className="mt-1 text-xs text-gray-500 truncate px-0.5">{img.label}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
