import createFetchClient, { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./schema";

export const fetchClient = createFetchClient<paths>({
  baseUrl: "https://backend-134243472228.asia-east1.run.app",
});
export const $api = createClient(fetchClient);
export type Sim = NonNullable<NonNullable<paths['/complete-order']['post']['responses']['200']['content']['application/json']['sims']>[number]>

const loggingMiddleware: Middleware = {
  async onRequest({ request }) {
    console.log("Request initiated", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
    });
    return request;
  },
  async onResponse({ response }) {
    console.log("Response received", {
      url: response.url,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.clone().json().catch(() => null),
    });
    return response;
  },
  onError({ error }) {
    console.error("Request failed", { error });
  },
};

fetchClient.use(loggingMiddleware);

