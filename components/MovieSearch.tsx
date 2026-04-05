"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Movie {
  tmdbId: number;
  title: string;
  year: string | null;
  poster: string | null;
}

interface Props {
  onSelect: (movie: Movie) => void;
  onClear?: () => void;
}

export default function MovieSearch({ onSelect, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || selected) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(movie: Movie) {
    setSelected(movie);
    setQuery(movie.title);
    setOpen(false);
    onSelect(movie);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setResults([]);
    onClear?.();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) {
              setSelected(null);
              onClear?.();
            }
          }}
          placeholder="Type a movie title…"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400"
        />
        {(query || selected) && (
          <button
            onClick={handleClear}
            className="shrink-0 text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>

      {loading && (
        <p className="absolute left-0 right-0 mt-1 text-xs text-gray-400 px-4">Searching…</p>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {results.map((movie) => (
            <li key={movie.tmdbId}>
              <button
                onClick={() => handleSelect(movie)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                {movie.poster ? (
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={32}
                    height={48}
                    className="rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-12 bg-gray-100 rounded shrink-0" />
                )}
                <span className="truncate">
                  <span className="font-medium">{movie.title}</span>
                  {movie.year && (
                    <span className="text-gray-400 ml-2 text-sm">{movie.year}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow px-4 py-3 text-sm text-gray-400">
          No movies found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
