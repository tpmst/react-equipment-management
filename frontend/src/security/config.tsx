declare global {
  interface Window {
    __env__?: {
      API_URL: string;
      API_PORT: string;
      COMPANY_NAME: string;
    };
  }
}

export const API_URL = window.__env__?.API_URL;
export const API_PORT = window.__env__?.API_PORT ?? "3000";
export const COMPANY_NAME = window.__env__?.COMPANY_NAME;
export const API_BASE_URL = `${API_URL}:${API_PORT}`;
