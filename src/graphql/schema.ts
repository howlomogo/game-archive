import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Platform {
    id: ID!
    name: String!
    slug: String!
  }

  type Company {
    id: ID!
    name: String!
    role: String! # e.g., "Developer" or "Publisher"
  }

  type Game {
    id: ID!
    title: String!
    releaseYear: Int
    summary: String
    coverUrlSmall: String
    coverUrlBig: String
    rating: Float
    platforms: [Platform!]!
    companies: [Company!]!
  }

  # Relay-Specification Cursor Pagination Objects
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type GameEdge {
    cursor: String!
    node: Game!
  }

  type GameConnection {
    edges: [GameEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    # Fetches a paginated, filterable list of games
    games(
      first: Int          # Number of items to fetch (Limit)
      after: String       # Cursor to fetch items after (Offset pointer)
      search: String      # Fuzzy search string
      platformIds: [ID!]  # Filter by specific platforms
    ): GameConnection!

    # Fetches metadata for filter options (e.g. populating a dropdown menu)
    platforms: [Platform!]!
  }
`;