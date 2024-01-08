#!/usr/bin/env node
"use strict";

const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");
const { Command } = require("commander");

const { version } = require("../package.json");
const { CATEGORY_MAP } = require(".");

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
      let fileString = `\
import { IconEntry, IconCategory, FigmaCategory } from "./types";

export const icons: ReadonlyArray<IconEntry> = [
`;

      res.data.icons.forEach((icon) => {
        if (!icon.category) {
          console.error(
            `${chalk.inverse.red(" FAIL ")} ${icon.name} missing Category`
          );
        }

        let figma_category = CATEGORY_MAP[icon.category];
        if (!figma_category) {
          console.error(
            `${chalk.inverse.red(" FAIL ")} Invalid category ${icon.category}`
          );
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
    published_in: ${icon.published_in.toFixed(1)},
    updated_in: ${icon.updated_in.toFixed(1)},
  },
`;
        console.log(`${chalk.inverse.green(" DONE ")} ${icon.name}`);
      });

      fileString += `
];
`;

      try {
        await fs.writeFile(path.join(__dirname, "../src/icons.ts"), fileString);
        console.log(
          `${chalk.green(" DONE ")} ${res.data.icons.length} icons ingested`
        );
      } catch (e) {
        console.error(`${chalk.inverse.red(" FAIL ")} Could not write file`);
      }
    } else {
      console.error(`${chalk.inverse.red(" FAIL ")} No data`);
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
