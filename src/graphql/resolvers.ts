import { queryIGDB } from "@/lib/igdb";

export const resolvers = {
  Query: {
    platforms: async () => {
      // Curated list of 20 iconic platforms
      const targetIds = "4,5,6,7,8,9,11,12,18,19,21,23,24,29,37,41,48,49,130,167,169,447";
      const query = "fields name, slug; limit 20; sort name asc; where id = (" + targetIds + ");";
      return await queryIGDB("platforms", query);
    },

    games: async (_: any, args: { first?: number; after?: string; search?: string; platformIds?: string[] }) => {
      const limit = args.first || 20;
      
      let offset = 0;
      if (args.after) {
        offset = parseInt(Buffer.from(args.after, "base64").toString("ascii"), 10);
      }

      // 🚨 FIX: Group the baseline global parameters cleanly
      let conditions: string[] = ["total_rating != null", "cover != null"];
      
      // 🚨 DYNAMIC FIX: Treat platforms as a dynamic collection (Array Contains matching)
      if (args.platformIds && Array.isArray(args.platformIds) && args.platformIds.length > 0) {
        // Using square brackets = [4,6] tells IGDB to look for games that contain ANY of these IDs, 
        // even if they have 10 other platforms attached to their record!
        conditions.push(`platforms = [${args.platformIds.join(",")}]`);
      }

      // If a search term is present, inject it inside the global evaluation condition
      if (args.search && args.search.trim() !== "") {
        conditions.push(`name ~ *"${args.search.trim()}"*`);
      }

      // Assemble base field variables string layout
      let igdbQuery = `fields name, first_release_date, summary, cover.image_id, platforms.name, platforms.slug, involved_companies.company.name, involved_companies.developer, total_rating; limit ${limit}; offset ${offset};`;

      // 🚨 THE CRUCIAL MAPPING CHANGE: Unify all global criteria under ONE single where clause parenthetical structure.
      // This tells IGDB to scan the global index first before cutting results by limit parameters.
      igdbQuery += ` where ${conditions.join(" & ")};`;
      igdbQuery += ` sort total_rating desc;`;

      const rawGames = await queryIGDB("games", igdbQuery);

      if (!rawGames || !Array.isArray(rawGames)) {
        return { 
          edges: [], 
          pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null, offset: offset }, 
          totalCount: 0 
        };
      }

      const edges = rawGames.map((game: any, index: number) => {
        const currentOffset = offset + index + 1;
        const nextCursor = Buffer.from(currentOffset.toString()).toString("base64");

        const releaseYear = game.first_release_date 
          ? new Date(game.first_release_date * 1000).getFullYear() 
          : null;

        const coverUrlSmall = game.cover?.image_id 
          ? "https://images.igdb.com/igdb/image/upload/t_cover_small/" + game.cover.image_id + ".jpg"
          : null;

        const coverUrlBig = game.cover?.image_id 
          ? "https://images.igdb.com/igdb/image/upload/t_cover_big/" + game.cover.image_id + ".jpg"
          : null;

        return {
          cursor: nextCursor,
          node: {
            id: game.id.toString(),
            title: game.name,
            releaseYear,
            summary: game.summary || "",
            coverUrlSmall, 
            coverUrlBig,   
            rating: game.total_rating ? parseFloat(game.total_rating.toFixed(1)) : null,
            platforms: game.platforms?.map((p: any) => ({ id: p.id.toString(), name: p.name, slug: p.slug })) || [],
            companies: game.involved_companies?.map((ic: any) => ({
              id: ic.company.id.toString(),
              name: ic.company.name,
              role: ic.developer ? "Developer" : "Publisher"
            })) || []
          }
        };
      });

      let dynamicTotal = offset + rawGames.length;
      if (rawGames.length === limit) {
        dynamicTotal = offset + limit + 1; 
      }

      return {
        edges,
        pageInfo: {
          hasNextPage: rawGames.length === limit,
          hasPreviousPage: offset > 0,
          // 🚨 FIXED: Safely fetch the cursor string token from the very first object inside the edges list array!
          startCursor: edges.length > 0 ? edges[0].cursor : null, 
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          offset: offset
        },
        totalCount: dynamicTotal
      };
    }
  }
};
