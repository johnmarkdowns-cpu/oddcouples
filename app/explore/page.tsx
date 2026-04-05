"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageData {
  id: string;
  url: string;
  label: string | null;
}

interface RankedResult {
  movieTitle: string;
  tmdbId: number | null;
  tmdbPoster: string | null;
  count: number;
}

export default function ExplorePage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<RankedResult[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((data) => {
        setImages(data);
        setLoadingImages(false);
      });
  }, []);

  function toggleSelect(id: string) {
    setResults(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // slide window — always keep exactly 2
      return [...prev, id];
    });
  }

  async function fetchResults() {
    if (selected.length !== 2) return;
    setLoadingResults(true);
    const res = await fetch(
      `/api/results?image1Id=${selected[0]}&image2Id=${selected[1]}`
    );
    const data = await res.json();
    setResults(data.results ?? []);
    setTotal(data.total ?? 0);
    setLoadingResults(false);
  }

  if (loadingImages) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Loading images…</p>
      </div>
    );
  }

  if (images.length < 2) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-gray-500 text-lg">No images available yet.</p>
        <p className="text-gray-400 text-sm">Check back after images have been uploaded.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Explore associations</h1>
        <p className="mt-2 text-gray-400 text-sm">
          Select two images to see what movies people associate with that pair.
        </p>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((img) => {
          const isSelected = selected.includes(img.id);
          const selectionIndex = selected.indexOf(img.id);
          return (
            <button
              key={img.id}
              onClick={() => toggleSelect(img.id)}
              className={`relative aspect-square rounded-xl overflow-hidden focus:outline-none transition-all ${
                isSelected
                  ? "ring-2 ring-gray-900 ring-offset-2"
                  : "hover:opacity-80"
              }`}
            >
              <Image
                src={img.url}
                alt={img.label ?? "Image"}
                fill
                className="object-cover"
                sizes="200px"
              />
              {isSelected && (
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {selectionIndex + 1}
                </div>
              )}
              {img.label && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-white text-xs truncate">{img.label}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action row */}
      {selected.length === 2 && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500">
            Showing results for images{" "}
            <strong>{images.find((i) => i.id === selected[0])?.label ?? "1"}</strong> and{" "}
            <strong>{images.find((i) => i.id === selected[1])?.label ?? "2"}</strong>
          </p>
          <button
            onClick={fetchResults}
            disabled={loadingResults}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loadingResults ? "Loading…" : "Show associations"}
          </button>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div className="mt-2">
          <p className="text-center text-sm text-gray-400 mb-6">
            {total === 0
              ? "No one has associated a movie with this pair yet."
              : `${total} response${total !== 1 ? "s" : ""} — ranked by most common`}
          </p>

          {results.length > 0 && (
            <ol className="flex flex-col gap-3 max-w-md mx-auto">
              {results.map((r, i) => (
                <li key={i} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl">
                  <span className="text-2xl font-bold text-gray-200 w-8 text-center shrink-0">
                    {i + 1}
                  </span>
                  {r.tmdbPoster ? (
                    <Image
                      src={r.tmdbPoster}
                      alt={r.movieTitle}
                      width={32}
                      height={48}
                      className="rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-12 bg-gray-100 rounded shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.movieTitle}</p>
                  </div>
                  <span className="text-sm text-gray-400 shrink-0">
                    {r.count} {r.count === 1 ? "vote" : "votes"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
