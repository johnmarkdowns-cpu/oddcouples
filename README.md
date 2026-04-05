# Odd Couples

A website where visitors are shown a random pair of images and asked what movie the combination reminds them of. Responses are saved so that, over time, any pair of images can be searched to see which movies people most commonly associate with it.

## Pages

| Route | Purpose |
|---|---|
| `/` | The guessing game — random pair + movie autocomplete |
| `/explore` | Select two images from the library → see ranked movie associations |
| `/admin` | Password-protected image upload and management |

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Prisma + Vercel Postgres** — data storage
- **Vercel Blob** — image hosting
- **TMDB API** — movie autocomplete
- **Tailwind CSS** — styling
- **Vercel** — deployment

---

## Local Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd oddcouples
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in each value:

```bash
cp .env.example .env.local
```

#### TMDB API key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to **Settings → API → Create → Developer**
3. Copy the **API Key (v3 auth)** and paste it as `TMDB_API_KEY`

#### Vercel Postgres

In your Vercel dashboard, create a Postgres database and link it to this project. Vercel will automatically populate `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`.

For local dev, copy those values from the Vercel dashboard into `.env.local`.

#### Vercel Blob

In your Vercel dashboard, create a Blob store and link it. Copy `BLOB_READ_WRITE_TOKEN` into `.env.local`.

#### Admin password

Set `ADMIN_PASSWORD` to any secret string. This is the password used to access `/admin`.

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add a **Postgres** database and a **Blob** store from the Storage tab
4. Add `TMDB_API_KEY` and `ADMIN_PASSWORD` as environment variables
5. Deploy — Vercel runs `prisma generate && next build` automatically

---

## How it works

### Pair normalization

To ensure that `{imageA, imageB}` and `{imageB, imageA}` are treated as the same pair, both image IDs are sorted lexicographically before being stored. `image1Id` is always ≤ `image2Id`.

### Data model

```
Image
  id, filename, url, label, createdAt

Response
  id, image1Id, image2Id, movieTitle, tmdbId, tmdbPoster, createdAt
```

### Aggregation

When showing results for a pair, responses are grouped by TMDB ID (or by lowercased movie title for free-text entries) and ranked by count descending.
