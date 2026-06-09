import type { ApiResponse } from "./types";

const clientId = (() => {
  const existing = localStorage.getItem("aurelia-client-id");
  if (existing) return existing;
  const value = crypto.randomUUID();
  localStorage.setItem("aurelia-client-id", value);
  return value;
})();

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      ...options.headers
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "Something went wrong.");
  return payload;
}

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
