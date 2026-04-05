import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 });
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&page=1`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  }

  const data = await res.json();

  const results = (data.results ?? []).slice(0, 8).map((m: {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string;
  }) => ({
    tmdbId: m.id,
    title: m.title,
    year: m.release_date?.slice(0, 4) ?? null,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w92${m.poster_path}`
      : null,
  }));

  return NextResponse.json({ results });
}
