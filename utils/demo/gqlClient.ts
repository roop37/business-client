import { GraphQLClient as RealGraphQLClient } from "graphql-request";
import { demoFetch } from "./fetch";

/**
 * Demo-mode GraphQLClient: same API as graphql-request, but every request is
 * answered by the local demo engine (no network, no backend).
 */
export class GraphQLClient extends RealGraphQLClient {
  constructor(url: string, options: ConstructorParameters<typeof RealGraphQLClient>[1] = {}) {
    super(url, { ...options, fetch: demoFetch as typeof fetch });
  }
}
