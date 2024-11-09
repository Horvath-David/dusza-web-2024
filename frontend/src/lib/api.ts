import { toast } from "solid-sonner";

export const API_URL = "http://localhost:8000/api";

export interface APIRequest {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  query?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  useAuthHeader?: boolean;
  canRefreshToken?: boolean;
  decodeJson?: boolean;
  useFormData?: boolean;
  noErrorToast?: boolean;
}

export interface APIResponse<T = any> extends Response {
  data: T | null;
}

function toFormData(body: any): URLSearchParams {
  const data = new URLSearchParams();
  for (const pair of Object.entries(body)) {
    data.append(pair[0], pair[1] as string);
  }
  return data;
}

async function doRequest(params: APIRequest): Promise<APIResponse> {
  params.method = params.method || "GET";
  params.useAuthHeader = params.useAuthHeader ?? false;
  params.decodeJson = params.decodeJson ?? true;

  const baseUrl = API_URL;
  const searchString = new URLSearchParams(params.query).toString();

  const resp = (await fetch(
    `${baseUrl}${params.endpoint}${searchString ? "?" + searchString : ""}`,
    {
      method: params.method,
      headers: {
        ...params.headers,
        ...(params.body && {
          "Content-Type": params.useFormData
            ? "application/x-www-form-urlencoded"
            : "application/json",
        }),
      },
      body: params.body
        ? params.useFormData
          ? toFormData(params.body)
          : JSON.stringify(params.body)
        : undefined,
      credentials: "include",
    },
  )) as APIResponse;

  if (params.decodeJson || !resp.ok) {
    try {
      const bodyJson = await resp.json();
      resp.data = bodyJson;
    } catch (e) {
      if (!params.noErrorToast) {
        toast.error("Hiba történt!", {
          description: `Ismeretlen hiba (${resp.status} ${resp.statusText})`,
        });
      }
      console.log(e);
    }
  }

  return resp;
}

export async function makeRequest<T = any>(
  params: APIRequest,
): Promise<APIResponse<T>> {
  const resp = await doRequest(params);
  if (resp.data?.error && !params.noErrorToast) {
    toast.error("Hiba történt!", { description: resp.data.error });
  }
  return resp;
}
