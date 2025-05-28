import { IContext } from "../core/index.js";

export type UserContext = IContext;
export type PipelineContext = IContext;

export type PageReq = {
  offset?: number;
  limit?: number;
  searchKey?: string;
  // sortBy?: string;
  // sortOrder?: "asc" | "desc";
};

export type PageRes = {
  offset?: number;
  limit?: number;
  total?: string;
  list: any[];
};
