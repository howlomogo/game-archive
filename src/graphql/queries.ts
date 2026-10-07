import { gql } from "@apollo/client";

export const GET_GAMES = gql`
  query GetGames(
    $first: Int
    $after: String
    $search: String
    $platformIds: [ID!]
    $sortBy: String
    $sortOrder: String
  ) {
    games(
      first: $first
      after: $after
      search: $search
      platformIds: $platformIds
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
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

export const GET_PLATFORMS = gql`
  query GetPlatforms {
    platforms {
      id
      name
      slug
    }
  }
`;
