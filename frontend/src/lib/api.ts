import { toast } from "solid-sonner";

export const API_URL = "http://localhost:8000";

export interface APIRequest {
  endpoint: string;
  method?: string;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
  useAuthHeader?: boolean;
  canRefreshToken?: boolean;
  decodeJson?: boolean;
  useFormData?: boolean;
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
      console.log(e);
    }
  }

  return resp;
}

export async function makeRequest(params: APIRequest): Promise<APIResponse> {
  const resp = await doRequest(params);
  if (resp.data?.error) {
    toast.error("Error occurred!", { description: resp.data.error });
  }
  return resp;
}
