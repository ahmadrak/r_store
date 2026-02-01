import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import type { ApiError } from "../types";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/signup") {
        console.warn("[API Client] 401 Unauthorized - redirecting to login");
        sessionStorage.setItem("redirectAfterLogin", currentPath);
        window.location.href = "/login";
      }
    }

    const apiError: ApiError = transformError(error);

    if (import.meta.env.DEV) {
      console.error("[API Error]", apiError);
    }

    return Promise.reject(apiError);
  },
);

function transformError(error: AxiosError): ApiError {
  if (!error.response) {
    return {
      message:
        error.message ||
        "Unable to connect to server. Please check your internet connection.",
      status: 0,
    };
  }

  const status = error.response.status;
  const data = error.response.data as any;

  let message: string;

  if (typeof data === "string") {
    message = data;
  } else if (data?.message) {
    message = data.message;
  } else if (data?.error) {
    message = data.error;
  } else {
    switch (status) {
      case 400:
        message = "Invalid request. Please check your input.";
        break;
      case 401:
        message = "Your session has expired. Please log in again.";
        break;
      case 403:
        message = "You don't have permission to perform this action.";
        break;
      case 404:
        message = "The requested resource was not found.";
        break;
      case 500:
        message = "Something went wrong on the server. Please try again later.";
        break;
      case 503:
        message = "Service temporarily unavailable. Please try again later.";
        break;
      default:
        message = `An error occurred (${status}). Please try again.`;
    }
  }

  return {
    message,
    status,
  };
}

export function isApiError(error: any): error is ApiError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "message" in error &&
    "status" in error &&
    typeof error.message === "string" &&
    typeof error.status === "number",
  );
}

export default apiClient;
