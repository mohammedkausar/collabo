import axios, { AxiosRequestConfig } from "axios";
import { root } from "@/service/send-api-req/endpoints";

const instance = axios.create({
  baseURL: root.baseUrl,
});

type SendApiRequest = AxiosRequestConfig & {
  requiresAuth: boolean;
};

let isRefreshing = false;

type customError = Error & { status?: number };

const failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: any) => void;
  config: SendApiRequest;
}> = [];

// To process the pending request in failed queue

const processQueue = (error: Error | null, newToken: string | null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else if (newToken && config.headers) {
      config.headers.Authorization = `Bearer ${newToken}`;
      resolve(config);
    }
  });
  failedQueue.length = 0;
};

//Refresh Token

const refreshAccessToken = async (): Promise<string> => {
  //TODO: Handle SSR ans CSR

  return "";
};

instance.interceptors.request.use(async (config: any) => {
  if (config.requiresAuth) {
    //TODO: Attach bearer toke from cookies here
  }

  return config;
});

instance.interceptors.response.use(
  (res) => res.data,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !originalRequest._retry &&
      originalRequest.headers?.Authorization
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then((config) => instance(config as AxiosRequestConfig))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        //Process the pending request after leader request
        processQueue(null, newToken);

        return instance(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          //TODO: removeToken()
          processQueue(refreshError as Error, null);
          window.location.href = "/";

          const err: customError = new Error("Authentication Failed");
          err.status = 401;
          throw err;
        }
      } finally {
        isRefreshing = false;
      }

      const err: customError = new Error(error?.message);
      err.status = error.response?.status;
      err.message = error.response?.data?.message;
      throw err;
    }

    return Promise.reject(error);
  }
);

const senApiReq = ({ method, params, ...rest }: SendApiRequest) => {};
