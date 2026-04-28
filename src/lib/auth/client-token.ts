"use client";
import Cookies from "js-cookie";
import { tokenEnums, tokenValidity } from "@/utils/index";

export const setToken = (token: string) => {
  const expires = new Date(
    new Date().getTime() + tokenValidity.accessToken * 1000
  );
  Cookies.set(tokenEnums.accessToken, token, { expires });
};

export const getToken = () => {
  Cookies.get(tokenEnums.accessToken);
};

export const removeToken = () => {
  Cookies.remove(tokenEnums.accessToken);
  Cookies.remove(tokenEnums.refreshToken);
};
