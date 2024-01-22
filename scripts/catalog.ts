#!/usr/bin/env node
"use strict";

import fs from "node:fs/promises";
import path from "path";
import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";

import { version } from "../package.json";
import { CATEGORY_MAP } from ".";

const ICON_API_URL = "https://api.phosphoricons.com";

const [MAJOR_PART, MINOR_PART] = version.split(".");
const CURRENT_NUMERIC_VERSION = +MAJOR_PART + +MINOR_PART / 10;

main().catch(console.error);

async function main() {
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
    const res = await axios.get(`${ICON_API_URL}?${params}`);
    if (res.data) {
      res.data.icons.sort((a, b) => (a.name < b.name ? -1 : 1));

      let fileString = `\
import { IconEntry, IconCategory, FigmaCategory } from "./types";

export type PhosphorIcon = typeof icons[number]

export const icons = <const>[
`;

      console.log(res.data.icons);
      res.data.icons.forEach((icon) => {
        if (!icon.codepoint) {
          console.error(
            `${chalk.inverse.red(" FAIL ")} ${icon.name} missing Codepoint`
          );
          throw new Error("codepoint");
        }

        if (!icon.category) {
          console.error(
            `${chalk.inverse.red(" FAIL ")} ${icon.name} missing Category`
          );
          throw new Error("category");
        }

        let figma_category = CATEGORY_MAP[icon.category];
        if (!figma_category) {
          console.error(
            `${chalk.inverse.red(" FAIL ")} Invalid category ${icon.category}`
          );
          throw new Error("figma_category");
        }

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
    figma_category: FigmaCategory.${figma_category},
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
        await fs.writeFile(path.join(__dirname, "../src/icons.ts"), fileString);
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
}

function pascalize(str) {
  return str
    .split("-")
    .map((substr) => substr.replace(/^\w/, (c) => c.toUpperCase()))
    .join("");
}
