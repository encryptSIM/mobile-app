import createFetchClient, { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { paths } from "./schema";
import { fetchClient } from "@/api/api";

export const airaloFetchClient = createFetchClient<paths>({
  baseUrl: "https://partners-api.airalo.com",
});

const TOKEN_STORAGE_KEY = '@api_token';
const TOKEN_EXPIRY_KEY = '@api_token_expiry';

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
      if (!expiryTime) return false;

      const now = Date.now();
      const expiry = parseInt(expiryTime, 10);

      return now < expiry - 5 * 60 * 1000;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  private async fetchTokenFromApi(): Promise<string | null> {
    try {

      const response = await fetchClient.GET('/airalo/token');

      if (response.error) {
        throw new Error(`Token fetch failed: ${response.error}`);
      }

      const newToken = response.data.data.access_token;
      const expiresIn = response.data.data.expires_in;

      const expiryTime = Date.now() + expiresIn * 1000;

      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, newToken],
        [TOKEN_EXPIRY_KEY, expiryTime.toString()],
      ]);

      return newToken;
    } catch (error) {
      console.error('Error fetching token from API:', error);
      return null;
    }
  }

  async getValidToken(): Promise<string | null> {
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchValidToken();
    const token = await this.tokenPromise;
    this.tokenPromise = null;
    return token;
  }

  private async fetchValidToken(): Promise<string | null> {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedToken && (await this.isTokenValid())) {
        return storedToken;
      }

      return await this.fetchTokenFromApi();
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, TOKEN_EXPIRY_KEY]);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }
}

const airaloAuthMiddleware: Middleware = {
  async onRequest({ request }) {
    const tokenManager = TokenManager.getInstance();
    const token = await tokenManager.getValidToken();

    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    return request;
  },
};

airaloFetchClient.use(airaloAuthMiddleware);

export const $api = createClient(airaloFetchClient);
