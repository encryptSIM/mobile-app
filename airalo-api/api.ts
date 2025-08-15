import createFetchClient, { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { paths } from "./schema";
import { fetchClient } from "@/api/api";

export type GetPackagesResponse = paths["/v2/packages"]["get"]["responses"]["200"]["content"]["application/json"];
export type Operator = NonNullable<NonNullable<GetPackagesResponse["data"]>[number]["operators"]>[number];
export type Coverage = NonNullable<Operator["coverages"]>[number];
export type Country = NonNullable<Operator["countries"]>[number];
export type Package = NonNullable<Operator["packages"]>[number];
export type Prices = NonNullable<Package["prices"]>["recommended_retail_price"];
export type Usage = NonNullable<NonNullable<paths['/v2/sims/{sim_iccid}/usage']['get']['responses']['200']['content']['application/json']>['data']>

export const airaloFetchClient = createFetchClient<paths>({
  baseUrl: "https://backend-134243472228.asia-east1.run.app",
});

const TOKEN_STORAGE_KEY = "@api_token";
const TOKEN_EXPIRY_KEY = "@api_token_expiry";

class TokenManager {
  private static instance: TokenManager;
  private tokenPromise: Promise<string | null> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private async isTokenValid(): Promise<boolean> {
    try {
      const expiryTime = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryTime) {
        console.warn("[TokenManager] Token expiry time not found.");
        return false;
      }

      const now = Date.now();
      const expiry = parseInt(expiryTime, 10);

      const isValid = now < expiry - 5 * 60 * 1000;
      console.info("[TokenManager] Token validity check:", { isValid, now, expiry });
      return isValid;
    } catch (error) {
      console.error("[TokenManager] Error checking token validity:", error);
      return false;
    }
  }

  private async fetchTokenFromApi(): Promise<string | null> {
    try {
      console.info("[TokenManager] Fetching token from API...");
      const response = await fetchClient.GET("/airalo/token");

      if (response.error) {
        throw new Error(`[TokenManager] Token fetch failed: ${response.error}`);
      }

      const newToken = response.data.data.access_token;
      const expiresIn = response.data.data.expires_in;

      const expiryTime = Date.now() + expiresIn * 1000;

      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, newToken],
        [TOKEN_EXPIRY_KEY, expiryTime.toString()],
      ]);

      console.info("[TokenManager] Token fetched and stored successfully.", {
        newToken,
        expiryTime,
      });

      return newToken;
    } catch (error) {
      console.error("[TokenManager] Error fetching token from API:", error);
      return null;
    }
  }

  async getValidToken(): Promise<string | null> {
    if (this.tokenPromise) {
      console.info("[TokenManager] Returning existing token promise.");
      return this.tokenPromise;
    }

    console.info("[TokenManager] Fetching valid token...");
    this.tokenPromise = this.fetchValidToken();
    const token = await this.tokenPromise;
    this.tokenPromise = null;
    return token;
  }

  private async fetchValidToken(): Promise<string | null> {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedToken && (await this.isTokenValid())) {
        console.info("[TokenManager] Returning stored valid token.");
        return storedToken;
      }

      console.info("[TokenManager] Stored token is invalid or missing. Fetching new token...");
      return await this.fetchTokenFromApi();
    } catch (error) {
      console.error("[TokenManager] Error getting valid token:", error);
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      console.info("[TokenManager] Clearing stored token...");
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, TOKEN_EXPIRY_KEY]);
      console.info("[TokenManager] Token cleared successfully.");
    } catch (error) {
      console.error("[TokenManager] Error clearing token:", error);
    }
  }
}

const airaloAuthMiddleware: Middleware = {
  async onRequest({ request }) {
    try {
      console.info("[airaloAuthMiddleware] Adding authorization header...");
      const tokenManager = TokenManager.getInstance();
      const token = await tokenManager.getValidToken();

      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
        console.info("[airaloAuthMiddleware] Authorization header added.");
      } else {
        console.warn("[airaloAuthMiddleware] No valid token available.");
      }

      return request;
    } catch (error) {
      console.error("[airaloAuthMiddleware] Error adding authorization header:", error);
      throw error;
    }
  },
};

airaloFetchClient.use(airaloAuthMiddleware);

export const $api = createClient(airaloFetchClient);
