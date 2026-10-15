import { FetchError, ofetch } from "ofetch";
import { z } from "zod";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// cookies (httpOnly access token) travel with every request
const client = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  retry: 0,
});

const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.boolean(), message: z.string(), data });

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

/**
 * Calls the API and validates the `data` field of the response with a Zod schema,
 * so the rest of the app only ever sees correctly typed data.
 */
export async function request<T extends z.ZodTypeAny>(
  schema: T,
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<z.infer<T>> {
  try {
    const response = await client(path, { method, body: body as Record<string, unknown> | undefined });
    return envelope(schema).parse(response).data;
  } catch (error) {
    if (error instanceof FetchError) {
      const status = error.statusCode ?? 0;
      const serverMessage = (error.data as { message?: string } | undefined)?.message;
      throw new ApiError(
        status,
        serverMessage ??
          (status === 0
            ? "Can't reach the server. Check your connection and try again."
            : "Something went wrong. Please try again."),
      );
    }
    if (error instanceof z.ZodError) {
      throw new ApiError(500, "The server sent an unexpected response.");
    }
    throw error;
  }
}

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";
