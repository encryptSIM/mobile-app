import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./schema";

export const fetchClient = createFetchClient<paths>({
  baseUrl: "https://backend-134243472228.asia-east1.run.app",
});
export const $api = createClient(fetchClient);
export type Sim = NonNullable<NonNullable<paths['/complete-order']['post']['responses']['200']['content']['application/json']['sims']>[number]>
