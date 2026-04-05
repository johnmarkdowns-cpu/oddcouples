"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import MovieSearch from "@/components/MovieSearch";

interface ImageData {
  id: string;
  url: string;
  label: string | null;
}

interface Movie {
  tmdbId: number;
  title: string;
  year: string | null;
  poster: string | null;
}

type Phase = "loading" | "playing" | "submitting" | "submitted" | "error";

export default function HomePage() {
  const [image1, setImage1] = useState<ImageData | null>(null);
  const [image2, setImage2] = useState<ImageData | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  const loadPair = useCallback(async () => {
    setPhase("loading");
    setSelectedMovie(null);
    try {
      const res = await fetch("/api/pair");
      if (!res.ok) throw new Error("not enough images");
      const data = await res.json();
      setImage1(data.image1);
      setImage2(data.image2);
      setPhase("playing");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    loadPair();
  }, [loadPair]);

  async function handleSubmit() {
    if (!selectedMovie || !image1 || !image2) return;
    setPhase("submitting");

    await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image1Id: image1.id,
        image2Id: image2.id,
        movieTitle: selectedMovie.title,
        tmdbId: selectedMovie.tmdbId,
        tmdbPoster: selectedMovie.poster,
      }),
    });

    setPhase("submitted");
    // Brief pause so the user sees confirmation, then load next pair
    setTimeout(loadPair, 800);
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-gray-500 text-lg">No images have been added yet.</p>
        <p className="text-gray-400 text-sm">
          Ask an admin to upload images to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Headline */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          What movie do these remind you of?
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Look at the pair of images together and name any movie that comes to mind.
        </p>
      </div>

      {/* Image pair */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {[image1, image2].map((img, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative"
          >
            {phase === "loading" || !img ? (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            ) : (
              <Image
                src={img.url}
                alt={img.label ?? `Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 400px"
              />
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {phase !== "loading" && (
          <MovieSearch
            onSelect={setSelectedMovie}
            onClear={() => setSelectedMovie(null)}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedMovie || phase === "submitting" || phase === "submitted"}
          className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
            phase === "submitted"
              ? "bg-green-500 text-white"
              : selectedMovie
              ? "bg-gray-900 text-white hover:bg-gray-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {phase === "submitting"
            ? "Saving…"
            : phase === "submitted"
            ? "Got it! Loading next pair…"
            : "Submit"}
        </button>

        <button
          onClick={loadPair}
          disabled={phase === "loading"}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          Skip this pair →
        </button>
      </div>
    </div>
  );
}
