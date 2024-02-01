"use strict";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { version } from "../package.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ASSETS_PATH = path.join(__dirname, "../assets");
export const RAW_PATH = path.join(__dirname, "../raw");
export const CATALOG_PATH = path.join(__dirname, "../src/icons.ts");

const [MAJOR_PART, MINOR_PART] = version.split(".");
export const CURRENT_NUMERIC_VERSION = +MAJOR_PART + +MINOR_PART / 10;

export const CATEGORY_MAP = {
  Arrows: "ARROWS",
  Brands: "BRAND",
  Commerce: "COMMERCE",
  Communication: "COMMUNICATION ",
  Design: "DESIGN",
  Development: "DEVELOPMENT",
  Education: "EDUCATION",
  Games: "GAMES",
  "Health & Wellness": "HEALTH",
  "Maps & Travel": "MAP",
  "Math & Finance": "FINANCE",
  Media: "MEDIA",
  "Office & Editing": "OFFICE",
  People: "PEOPLE",
  "Security & Warnings": "SECURITY",
  "System & Devices": "SYSTEM",
  Time: "TIME",
  "Weather & Nature": "WEATHER",
};

export type IconStatus =
  | "Backlog"
  | "Designing"
  | "Designed"
  | "Implemented"
  | "Deprecated"
  | "";

export type IconMetadata = {
  name: string;
  alias?: string;
  rid: string;
  category: keyof typeof CATEGORY_MAP;
  tags: string[];
  search_categories: string[];
  status: IconStatus;
  codepoint?: number;
  published: boolean;
  published_in: number;
  updated_in: number;
  notes?: string;
};

export type IconAPIResponse = {
  icons: IconMetadata[];
  count: number;
  version: number;
};
