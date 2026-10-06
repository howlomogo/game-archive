"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { ReactNode } from "react";

// Explicitly use HttpLink to pass the URI parameter, bypassing the type mismatch
const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          games: {
            keyArgs: ["search", ["platformIds"]],
            merge(existing, incoming, { args }) {
              if (!args || !args.after) {
                return incoming;
              }
              const existingEdges = existing?.edges || [];
              const incomingEdges = incoming?.edges || [];
              return {
                ...incoming,
                edges: [...existingEdges, ...incomingEdges],
              };
            },
          },
        },
      },
    },
  }),
});

interface ApolloWrapperProps {
  children: ReactNode;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}