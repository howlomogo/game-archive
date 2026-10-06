import { queryIGDB } from "@/lib/igdb";

export const resolvers = {
  Query: {
    platforms: async () => {
      // Fetch major platform categories to populate the dropdown filter bar options
      const query = "fields name, slug; limit 20; sort name asc; where id = (6, 9, 12, 14, 48, 49, 130, 167, 169);";
      return await queryIGDB("platforms", query);
    },

    games: async (_: any, args: { first?: number; after?: string; search?: string; platformIds?: string[] }) => {
      const limit = args.first || 20;
      
      // Decode the cursor base64 string layout into standard offset integers
      let offset = 0;
      if (args.after) {
        offset = parseInt(Buffer.from(args.after, "base64").toString("ascii"), 10);
      }

      // Build out dynamic parameter conditions matching user selections
      let conditions: string[] = [];
      if (args.platformIds && Array.isArray(args.platformIds) && args.platformIds.length > 0) {
        conditions.push(`platforms = (${args.platformIds.join(",")})`);
      }

      let igdbQuery = `fields name, first_release_date, summary, cover.image_id, platforms.name, platforms.slug, involved_companies.company.name, involved_companies.developer, total_rating; limit ${limit}; offset ${offset};`;

      if (args.search) {
        igdbQuery += ` search "${args.search}";`;
      } else {
        if (conditions.length > 0) {
          igdbQuery += ` where ${conditions.join(" & ")};`;
        }
        // Baseline criteria: ensure we sort by rating and ignore games missing covers
        igdbQuery += ` sort total_rating desc; where total_rating != null & cover != null;`;
      }

      const rawGames = await queryIGDB("games", igdbQuery);

      if (!rawGames || !Array.isArray(rawGames)) {
        return { 
          edges: [], 
          pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null }, 
          totalCount: 0 
        };
      }

      // Map raw data arrays into our strictly typed GraphQL nodes
      const edges = rawGames.map((game: any, index: number) => {
        const currentOffset = offset + index + 1;
        const nextCursor = Buffer.from(currentOffset.toString()).toString("base64");

        const releaseYear = game.first_release_date 
          ? new Date(game.first_release_date * 1000).getFullYear() 
          : null;

        const coverSmallUrl = game.cover?.image_id 
          ? "https://images.igdb.com/igdb/image/upload/t_cover_small/" + game.cover.image_id + ".jpg"
          : null;

        const coverBigUrl = game.cover?.image_id 
          ? "https://images.igdb.com/igdb/image/upload/t_cover_big/" + game.cover.image_id + ".jpg"
          : null;

        return {
          cursor: nextCursor,
          node: {
            id: game.id.toString(),
            title: game.name,
            releaseYear,
            summary: game.summary || "",
            coverUrlSmall: coverSmallUrl,
            coverUrlBig: coverBigUrl,
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
          hasNextPage: edges.length === limit,
          hasPreviousPage: offset > 0,
          // Fixed bracket index pointers to avoid the whole-array property crash:
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount: 5000
      };
    }
  }
};
