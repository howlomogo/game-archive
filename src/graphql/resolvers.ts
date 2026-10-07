import { queryIGDB } from "@/lib/igdb";

export const resolvers = {
  Query: {
    platforms: async () => {
      const targetIds = "4,5,6,7,8,9,11,12,18,19,21,23,24,29,37,41,48,49,130,167,169,447";
      const query = `fields name, slug; limit 20; sort name asc; where id = (${targetIds});`;
      return await queryIGDB("platforms", query);
    },

    games: async (_: any, args: { search?: string; platformIds?: string[], sortBy?: string, sortOrder?: string }) => {
      let conditions: string[] = ["total_rating != null", "cover != null"];
      
      if (args.search && args.search.trim() !== "") {
        const sanitizedSearch = args.search.trim().replace(/"/g, '\\"');
        conditions.push(`name ~ *"${sanitizedSearch}"*`);
      }

      // 🚨 DYNAMIC FIX: Treat platforms as a dynamic collection (Array Contains matching)
      if (args.platformIds && Array.isArray(args.platformIds) && args.platformIds.length > 0) {
        // Using square brackets = [4,6] tells IGDB to look for games that contain ANY of these IDs, 
        // even if they have 10 other platforms attached to their record!
        conditions.push(`platforms = [${args.platformIds.join(",")}]`);
      }

      let sortField = "total_rating";
      if (args.sortBy === "title") sortField = "name";
      if (args.sortBy === "releaseYear") sortField = "first_release_date";

      const direction = args.sortOrder === "asc" ? "asc" : "desc";

      // 🚨 CRITICAL ADJUSTMENT: Pull a unified 100-record set sorted at the API root level.
      // We will slice this smoothly inside the React tree to stop the IGDB offset bugs from repeating data.
      let igdbQuery = `fields name, first_release_date, summary, cover.image_id, platforms.name, platforms.slug, involved_companies.company.name, involved_companies.developer, total_rating; limit 100;`;
      igdbQuery += ` where ${conditions.join(" & ")};`;
      igdbQuery += ` sort ${sortField} ${direction};`;

      const rawGames = await queryIGDB("games", igdbQuery);

      if (!rawGames || !Array.isArray(rawGames)) {
        return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null, offset: 0 }, totalCount: 0 };
      }

      const edges = rawGames.map((game: any) => {
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
          cursor: "unsupported",
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

      return {
        edges,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
          offset: 0
        },
        totalCount: rawGames.length
      };
    }
  }
};
