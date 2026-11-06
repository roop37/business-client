import { runDemoOperation } from "./engine";

/** Drop-in `fetch` for GraphQLClient: answers locally, never touches the network. */
export const demoFetch = async (
  _input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  let query = "";
  let variables: Record<string, any> = {};
  try {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
    query = body.query ?? "";
    variables = body.variables ?? {};
  } catch {
    /* ignore */
  }
  const result = runDemoOperation(query, variables);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
