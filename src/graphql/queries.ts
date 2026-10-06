import { gql } from "@apollo/client";

// Query to fetch the list of games for our data grid
export const GET_GAMES = gql`
  query GetGames($first: Int, $after: String, $search: String, $platformIds: [ID!]) {
    games(first: $first, after: $after, search: $search, platformIds: $platformIds) {
      edges {
        cursor
        node {
          id
          title
          releaseYear
          summary
          coverUrlSmall
          coverUrlBig
          rating
          platforms {
            id
            name
          }
          companies {
            id
            name
            role
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        offset
      }
      totalCount
    }
  }
`;

// Query to fetch platforms to populate our filter dropdown
export const GET_PLATFORMS = gql`
  query GetPlatforms {
    platforms {
      id
      name
      slug
    }
  }
`;