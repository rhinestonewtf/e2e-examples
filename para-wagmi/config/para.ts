"use client";

import { ParaWeb, Environment } from "@getpara/react-sdk";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY as string;
const ENVIRONMENT = Environment.BETA;

// Create Para client instance (only in browser)
export const para =
  typeof window !== "undefined" ? new ParaWeb(ENVIRONMENT, API_KEY) : null;
