import { z } from "zod";
import { Data } from ".";
import { NextApiRequest, NextApiResponse } from "next";
import { createRequest, createResponse } from "node-mocks-http";

export * from "@/types/zod";

/* 
  Types for testing Api
*/
export type TypeData = z.infer<typeof Data>;
export type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
export type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;
