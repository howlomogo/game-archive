# 🎮 Retro Gaming Archive Ledger Dashboard

A high-performance, responsive gaming archive dashboard built using **Next.js 14 App Router**, **GraphQL (Apollo Client/Server)**, and **Tailwind CSS**. The platform provides global dataset searches, complex column sorting, and seamless paginated navigation pulling data dynamically via an optimized API proxy routing to the Internet Game Database (IGDB).

---

## 🏗️ Architecture Design & The Hybrid Memory Pattern

Standard full-text query search implementations on the IGDB API prioritize a rigid text-similarity matrix. This internal routing forcefully locks and suppresses traditional database pagination commands (such as `offset`), which causes public endpoints to serve duplicate elements or freeze when moving across data page windows.

To bypass this platform constraint, this application utilizes a **Hybrid Client-Memory Pagination Window Pattern**:

1. **The Server Layer:** When a search criteria or platform check is modified, the backend GraphQL resolver queries a unified, high-performance dataset pool (up to 100 rows) matching your strict column sort constraints directly from the database core.
2. **The Client Layer:** The React data grid accepts the sorted dataset pool and segments exactly 20 records required for the active view matching the local `pageIndex` pointer using memory slicing (`visibleEdges = gamesEdges.slice(startOffset, endOffset)`).

This architecture completely decouples pagination from the broken API layer, ensuring **instantaneous page turning with absolutely zero duplicate records or trailing network latency**.

---

## 🗂️ Project Component Map

### 1. `src/graphql/resolvers.ts` (Backend Gateway)

Handles structural validation, sanitizes inputs, and handles case-insensitive fuzzy string match logic (`name ~ *""*`). It automatically queries and serves globally ordered game logs straight to the frontend network layer.

### 2. `src/components/table/data-table.tsx` (Data Grid Engine)

The main client-side interface component. It maintains reactive internal states (`pageIndex`, `activeSortBy`, `activeSortOrder`) to control layout adjustments. It handles fixed cell formatting and splits massive record pools cleanly on screen.

### 3. `src/components/table/filter-bar.tsx` (Interactive Controls)

A fully controlled submission component panel. It features boundary click event listeners (`useRef`) to automatically slide close dropdown states, allowing users to toggle search phrases and target systems seamlessly.

---

## ⚡ Production Layout & Performance Features

- **Anti-Flicker Layout Grid Enforcements:** The table element incorporates the Tailwind `table-fixed` property paired with explicit pixel width constraints on header elements (`w-20`, `w-36`). This prevents columns from expanding or shrinking based on varying row title string lengths, eliminating layout flickering on page turns.
- **Smart Text Truncation (`truncate`):** Long game titles and studio records wrap cleanly into an ellipsis constraint. The container appends a native browser hover tooltip (`title={node.title}`) to maintain accessibility without taking up unnecessary screen space.
- **Apollo Client Network Shielding:** Configured with an aggressive `cache-first` fetch policy. Toggling back and forth between sorting criteria or platform sets the user has already viewed pulls data instantly from the local Apollo Client memory cache, **completely protecting your database wrapper from repetitive HTTP hits**.
- **Dossier-Grade Expanded Accordion Panels:** Expanding an active row draws an asymmetric, high-end profile card displaying high-resolution artwork (`coverUrlBig`), tabular studio tracking chips, detailed system deployment tags, and formatted synopses.

---

## 🏃 Local Development Quickstart

Ensure you have your environment variables set up in your local configuration files, then execute these commands in your terminal window:

```bash
# Install package dependencies
npm install

# Force a clean, un-cached Next.js compilation  sweep
rm -rf .next && npm run dev
```

Open your browser to **`http://localhost:3000`** (preferably in an **Incognito / Private window** to ensure a fresh, un-cached client runtime).
