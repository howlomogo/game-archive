# 🎮 Video Games Archive Ledger & Data Grid

A high-performance, real-time data grid dashboard exploring historical media records. This project features a robust **GraphQL proxy architecture** built on top of **Next.js** and **Apollo Client**, interfacing directly with the official **Twitch IGDB API**.

## 🚀 Key Architectural Accomplishments

- **Unified Query Compilation Engine**: Overcomes strict syntax restrictions in the legacy IGDB API by programmatically merging full-text case-insensitive fuzzy filtering and complex array containment selectors (`platforms = [...]`) into a single, optimized `where` clause.
- **Zero-Width Column Grid Isolation**: Features interactive expandable sub-row panels utilizing inset-shadow rings and absolute overlay boundaries, guaranteeing that heavy high-resolution media payloads (`coverUrlBig`) load exclusively on demand with **0px of layout twitching or column shifting**.
- **Dynamic Upper Boundary Tracking**: Solves the resource-intensive limitations of cursor-based total database counts by rendering performance-optimized open-ended indices (`Showing 21–40 of 40+ results`) until the absolute boundary ceiling is hit, safely avoiding strict API rate-limiting blocks.
- **Staged Filter State Architecture**: Groups search inputs, multi-select dropdown checklists, and column properties into local components, bundling execution intent together. This protects external endpoints from multi-click round-trip spam and layout flickering.

---

## 🛠️ Tech Stack & Ecosystem

- **Framework**: Next.js 14+ (App Router, Client Control Layer)
- **Data Transport**: GraphQL (Apollo Client Client-Side, Graphql-Yoga / Next Server-Side Schema)
- **Styling & UI**: Tailwind CSS, Lucide React Icons
- **Core API Data Source**: Twitch IGDB API (Games & Platforms catalogs)

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── layout.tsx         # Root layout context wrappers
│   └── page.tsx           # Dashboard view canvas container
├── components/
│   └── table/
│       ├── data-table.tsx # Master layout controller state machine
│       ├── filter-bar.tsx # Staged parameter submission block
│       └── table-skeleton.tsx # Shimmer placeholder animation layout
├── graphql/
│   ├── queries.ts         # Frontend Apollo Client query schemas
│   ├── resolvers.ts       # Backend IGDB condition string compiler
│   └── schema.ts          # Central GraphQL type specifications
└── lib/
    └── igdb.ts            # Secure server-to-server fetch engine
```

---

## ⚙️ Data Flow & State Operations Lifecycle

### 1. Client-Side Interaction & Staging

The user checks platform checkboxes or types a search query. The `FilterBar` component holds these changes locally in a `stagedPlatforms` React state array. This prevents premature, resource-heavy API network requests while the user is still clicking.

### 2. Execution & State Reset

When the user clicks the **Search** button, the inputs are bundled together and fired up to the parent controller. The parent immediately triggers `setActiveCursor(null)` and `setExpandedRowId(null)`, gracefully clearing page history variables and collapsing open detail cards to pull fresh Page 1 indices.

### 3. Server-Side AST Translation

The compiled query hits the internal NextJS GraphQL server route. The `resolvers.ts` file intercepts the arguments and maps them into an official IGDB script format:

```text
fields name, cover.image_id, total_rating;
where total_rating != null & platforms = [4,6,167] & name ~ *"Mario"*;
sort total_rating desc;
limit 20;
offset 0;
```

### 4. Optimized Payload Streams

The remote server replies with optimized JSON data fragments. The resolver structures these fields into explicit `coverUrlSmall` (t_cover_small) and `coverUrlBig` (t_cover_big) endpoints. The client reads these values via Apollo’s `network-only` fetch policy, rendering the table rows instantly.

---

## 🚀 Local Development Setup

### 📋 Prerequisites

Ensure you have **Node.js 18+** installed on your machine. You will also need active developer credentials from the [Twitch Developer Portal](https://twitch.tv).

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com
cd YOUR_REPOSITORY_NAME
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory of your project:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3000/api/graphql
TWITCH_CLIENT_ID=your_twitch_client_id_here
TWITCH_APP_ACCESS_TOKEN=your_twitch_access_token_here
```

### 3. Clean and Run the Development Server

Flush out any static asset directories and launch the local pipeline:

```bash
# On Mac/Linux:
rm -rf .next && npm run dev

# On Windows (PowerShell):
Remove-Item -Recurse -Force .next; npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) to view the running dashboard.

---

## 📝 Licence

Distributed under the MIT Licence. See `LICENCE` for more information.
