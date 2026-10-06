import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import { NextRequest, NextResponse } from "next/server";

// 1. Initialise the Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// 2. Create the unified Next.js App Router handler
const handler = startServerAndCreateNextHandler<NextRequest>(server);

// 3. Catch inbound data queries from Apollo Client (Crucial for fixing the 405)
export async function POST(request: NextRequest) {
  return handler(request);
}

// 4. Catch direct browser tab visits or testing pings gracefully
export async function GET(request: NextRequest) {
  return handler(request);
}