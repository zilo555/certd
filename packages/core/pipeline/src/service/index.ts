export * from "./email.js";
export * from "./cname.js";
export * from "./config.js";
export * from "./url.js";
export * from "./emit.js";
export type IServiceGetter = {
  get: <T>(name: string) => Promise<T>;
};
