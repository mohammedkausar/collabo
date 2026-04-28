export const tokenEnums = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export const tokenValidity = {
  accessToken: 60 * 30, //30 min
  refreshToken: 60 * 60 * 24 * 7, //7 Days
} as const;
