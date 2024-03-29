#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import chalk from "chalk";

import { ASSETS_PATH, RAW_PATH } from ".";

let sourcePath = "./SVGs";
let destPath = ASSETS_PATH;
let fileType = "svg";
let svgType = "raw";

main().catch(console.error);

async function main() {
  if (process.argv[2]) {
    const dest = process.argv[2];
    if (fs.existsSync(dest) && fs.lstatSync(dest).isDirectory()) {
      sourcePath = dest;
    } else {
      console.error(
        `${chalk.inverse.red(" FAIL ")} Invalid destination ${dest}`
      );
      process.exit(1);
    }
  }

  if (process.argv[3]) {
    const format = process.argv[3].toLowerCase();
    if (["svg", "png"].includes(format)) {
      fileType = format;
    } else {
      console.error(
        `${chalk.inverse.red(" FAIL ")} Invalid file type ${process.argv[3]}`
      );
      process.exit(1);
    }
  }

  if (process.argv[4]) {
    const inputType = process.argv[4].toLowerCase();
    if (["raw", "flat"].includes(inputType)) {
      svgType = inputType;
      if (inputType === "raw") {
        destPath = RAW_PATH;
      }
    } else {
      console.error(
        `${chalk.inverse.red(" FAIL ")} Invalid svg type ${process.argv[4]}`
      );
      process.exit(1);
    }
  }

  const files = fs.readdirSync(sourcePath, "utf-8");
  const fileTypeExpr = RegExp(`.*\.${fileType}$`);

  for (let file of files) {
    // Only matching filetypes!
    if (!file.match(fileTypeExpr)) continue;

    let folder = getWeightFromFilename(file);
    await transformAndRelocateFile(file, folder);
  }
}

function getWeightFromFilename(fileName: string) {
  const parts = fileName.split(`.${fileType}`)[0].split("-");
  const weightOrLastIdentifier = parts.slice(-1)[0];
  switch (weightOrLastIdentifier) {
    case "thin":
    case "light":
    case "bold":
    case "fill":
    case "duotone":
      return weightOrLastIdentifier;
    default:
      return "regular";
  }
}

async function transformAndRelocateFile(fileName: string, folderName: string) {
  const oldPath = path.join(sourcePath, fileName);
  const folderPath = path.join(destPath, folderName);
  const newPath = path.join(folderPath, fileName);

  // Replace literal black "#000" with "currentColor"
  const colorLiteralExpr = /#0+/g;
  const colorLiteralReplacer = new Transform({
    // NOTE: this may be flaky due to chunks split in the middle of a color literal!
    // Though unlikely due to default `highWaterMark` of 64kb, it is totally possible
    // for smaller chunks to be emitted. We can revert to a synchronous transform if needed.
    transform(chunk, _encoding, callback) {
      const replaced = chunk
        .toString()
        .replaceAll(colorLiteralExpr, "currentColor");
      callback(null, replaced);
    },
  });

  // Append `fill="currentColor"` attribute to <svg> node
  const svgOpenTagExpr = /<svg ([^>]*)>/g;
  const svgFillInjector = new Transform({
    // NOTE: this may be flaky due to chunks split in the middle of a color literal!
    // Though unlikely due to default `highWaterMark` of 64kb, it is totally possible
    // for smaller chunks to be emitted. We can revert to a synchronous transform if needed.
    transform(chunk, _encoding, callback) {
      const replaced = chunk
        .toString()
        .replace(svgOpenTagExpr, `<svg $1 fill="currentColor">`);
      callback(null, replaced);
    },
  });

  // Make directory if needed
  if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
    fs.mkdirSync(folderPath);
  }

  console.info(chalk.green`${newPath}`);

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on("error", reject);
    writeStream.on("error", reject);
    colorLiteralReplacer.on("error", reject);
    svgFillInjector.on("error", reject);
    readStream.on("close", () => {
      // fs.unlink(oldPath, (err) => {
      //   if (err) reject(err);
      //   resolve();
      // });
      resolve(void 0);
    });

    if (fileType === "png") {
      readStream.pipe(writeStream);
    } else {
      if (svgType === "raw") {
        readStream.pipe(colorLiteralReplacer).pipe(writeStream);
      } else {
        readStream.pipe(svgFillInjector).pipe(writeStream);
      }
    }
  });
}
