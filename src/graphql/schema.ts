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
    role: String!
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

  type GameEdge {
    cursor: String!
    node: Game!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    offset: Int!
  }

  type GameConnection {
    edges: [GameEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    platforms: [Platform!]!
    games(
      first: Int
      after: String
      search: String
      platformIds: [ID!]
      sortBy: String
      sortOrder: String
    ): GameConnection!
  }
`;
