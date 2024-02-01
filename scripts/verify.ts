#!/usr/bin/env node
"use strict";

import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { parse, type INode } from "svgson";
import {
  ASSETS_PATH,
  CATEGORY_MAP,
  CURRENT_NUMERIC_VERSION,
  type IconAPIResponse,
  type IconMetadata,
} from ".";

const PUA_START = 57344;
const PUA_END = 63743;

const WEIGHTS = new Set([
  "regular",
  "thin",
  "light",
  "bold",
  "fill",
  "duotone",
]);

const INODE_CHECKS: Record<string, (i: INode) => boolean> = {
  "does not use currentColor": (i) => i.attributes["fill"] !== "currentColor",
  "has incorrect viewBox": (i) => i.attributes["viewBox"] !== "0 0 256 256",
} as const;

const INODE_WARNINGS: Record<string, (i: INode) => boolean> = {
  "has non-path elements": (i) => i.children.some((c) => c.name !== "path"),
} as const;

const METADATA_CHECKS: Record<string, (m: IconMetadata) => boolean> = {
  "is not assigned a valid codepoint": (m) =>
    !m.codepoint || m.codepoint < PUA_START || m.codepoint > PUA_END,
  "is not assigned a valid category": (m) =>
    !m.category || !CATEGORY_MAP[m.category],
  "has invalid version": (m) =>
    !m.published_in ||
    !m.updated_in ||
    m.published_in > CURRENT_NUMERIC_VERSION ||
    m.updated_in > CURRENT_NUMERIC_VERSION ||
    m.published_in > m.updated_in,
} as const;

const API_CHECKS: Record<string, (r: IconAPIResponse) => boolean> = {
  "incorrect icon count": (r) => r.count !== r.icons.length,
  "invalid API version": (r) => r.version !== CURRENT_NUMERIC_VERSION,
};

function verifyINode(i: INode, name: string, weight: string): boolean {
  let valid = true;

  for (const [err, assertion] of Object.entries(INODE_CHECKS)) {
    if (assertion(i)) {
      valid = false;
      console.error(
        `${chalk.inverse.red(" FAIL ")} ${name}${
          weight === "regular" ? "" : `-${weight}`
        } ${err}`
      );
    }
  }

  for (const [err, assertion] of Object.entries(INODE_WARNINGS)) {
    if (assertion(i)) {
      console.error(
        `${chalk.inverse.yellow(" WARN ")} ${name}${
          weight === "regular" ? "" : `-${weight}`
        } ${err}`
      );
    }
  }

  return valid;
}

function verifyIconMetadata(m: IconMetadata): boolean {
  let valid = true;

  for (const [err, assertion] of Object.entries(METADATA_CHECKS)) {
    if (assertion(m)) {
      valid = false;
      console.error(`${chalk.inverse.red(" FAIL ")} ${m.name} ${err}`);
    }
  }

  return valid;
}

export async function assertValidAssets(): Promise<void> {
  const assetsFolder = await fs.readdir(ASSETS_PATH, "utf-8");

  const icons: Record<string, Record<string, boolean>> = {};

  await Promise.all(
    assetsFolder.map(async (weight) => {
      if (!(await fs.lstat(path.join(ASSETS_PATH, weight))).isDirectory())
        return;

      if (!WEIGHTS.has(weight)) {
        console.error(
          `${chalk.inverse.red(" FAIL ")} Bad folder name ${weight}`
        );
        process.exit(1);
      }

      const files = await fs.readdir(path.join(ASSETS_PATH, weight));
      await Promise.all(
        files.map(async (filename) => {
          let name: string;
          const nameParts = filename.split(".svg")[0].split("-");
          if (nameParts[nameParts.length - 1] === weight) {
            name = nameParts.slice(0, -1).join("-");
          } else {
            name = nameParts.join("-");
          }

          if (!icons[name]) {
            icons[name] = {};
          }

          const filepath = path.join(ASSETS_PATH, weight, filename);
          const file = (await fs.readFile(filepath)).toString("utf-8");
          const inode = await parse(file);
          icons[name][weight] = verifyINode(inode, name, weight);
        })
      );
    })
  );

  let inodeErrors = 0;
  for (const weights of Object.values(icons)) {
    for (const [weight, valid] of Object.entries(weights)) {
      if (!WEIGHTS.has(weight) || !valid) {
        inodeErrors += 1;
      }
    }
  }

  if (inodeErrors > 0) {
    throw new Error(`${inodeErrors} bad assets`);
  }
}

export function assertValidApiResponse(r: IconAPIResponse) {
  let valid = true;

  for (const [err, assertion] of Object.entries(API_CHECKS)) {
    if (assertion(r)) {
      valid = false;
      console.error(`${chalk.inverse.red(" FAIL ")} ${err}`);
    }
  }

  if (!valid) {
    throw new Error("api response");
  }

  const metadataErrors = r.icons.reduce(
    (errs, m) => errs + +!verifyIconMetadata(m),
    0
  );

  if (metadataErrors > 0) {
    throw new Error(`${metadataErrors} bad metadatas`);
  }
}
