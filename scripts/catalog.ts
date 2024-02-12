#!/usr/bin/env node
"use strict";

import fs from "node:fs/promises";
import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";

import { version } from "../package.json";
import { assertValidAssets, assertValidApiResponse } from "./verify";
import {
  CATALOG_PATH,
  CATEGORY_MAP,
  CURRENT_NUMERIC_VERSION,
  type IconAPIResponse,
} from ".";

const ICON_API_URL = "https://api.phosphoricons.com";

(async function main() {
  const program = new Command();
  program
    .version(version)
    .option(
      "-r --release <version>",
      "Fetch icons from Phosphor API and compile to internal data structure"
    )
    .option("-p --published", "Published status of icons")
    .option("-P, --no-published", "Published status of icons")
    .option("-q --query <text>", "Fulltext search term")
    .option("-n --name <name>", "Exact icon namee match");

  program.parse(process.argv);
  const params = new URLSearchParams(Object.entries(program.opts())).toString();

  try {
    await assertValidAssets();

    const res = await axios.get<IconAPIResponse>(`${ICON_API_URL}?${params}`);
    if (res.data) {
      assertValidApiResponse(res.data);

      res.data.icons.sort((a, b) => (a.name < b.name ? -1 : 1));

      let fileString = `\
import { IconEntry, IconCategory, FigmaCategory } from "./types";

export type PhosphorIcon = typeof icons[number]

export const icons = <const>[
`;

      res.data.icons.forEach((icon) => {
        let categories = "[";
        icon.search_categories?.forEach((c) => {
          categories += `IconCategory.${c.toUpperCase()},`;
        });
        categories += "]";

        fileString += `\
  {
    name: "${icon.name}",
    pascal_name: "${pascalize(icon.name)}",${
          !!icon.alias
            ? `alias: { name: "${icon.alias}", pascal_name: "${pascalize(
                icon.alias
              )}" },`
            : ""
        }
    categories: ${categories},
    figma_category: FigmaCategory.${CATEGORY_MAP[icon.category]},
    tags: ${JSON.stringify([
      ...(icon.published_in >= CURRENT_NUMERIC_VERSION
        ? ["*new*"]
        : icon.updated_in === CURRENT_NUMERIC_VERSION
        ? ["*updated*"]
        : []),
      ...icon.tags,
    ])},
    codepoint: ${icon.codepoint},
    published_in: ${icon.published_in.toFixed(1)},
    updated_in: ${icon.updated_in.toFixed(1)},
  },
`;
        console.log(`${chalk.inverse.green(" DONE ")} ${icon.name}`);
      });

      fileString += `
] satisfies readonly IconEntry[];
`;

      try {
        await fs.writeFile(CATALOG_PATH, fileString);
        console.log(
          `${chalk.green(" DONE ")} ${res.data.icons.length} icons ingested`
        );
      } catch (e) {
        console.error(`${chalk.inverse.red(" FAIL ")} Could not write file`);
        process.exit(1);
      }
    } else {
      console.error(`${chalk.inverse.red(" FAIL ")} No data`);
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})().catch(console.error);

function pascalize(str) {
  return str
    .split("-")
    .map((substr) => substr.replace(/^\w/, (c) => c.toUpperCase()))
    .join("");
}
