#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";

let source_path = "./SVGs";
let file_type = "svg";
let svg_type = "raw";

main().catch(console.error);

async function main() {
  if (process.argv[2]) {
    const dest = process.argv[2];
    if (fs.existsSync(dest) && fs.lstatSync(dest).isDirectory()) {
      source_path = dest;
    } else {
      console.error(`Invalid destination ${dest}`);
      process.exit(1);
    }
  }

  if (process.argv[3]) {
    const input_type = process.argv[3].toLowerCase();
    if (["svg", "png"].includes(input_type)) {
      file_type = input_type;
    } else {
      console.error(`Invalid file type ${process.argv[3]}`);
      process.exit(1);
    }
  }

  if (process.argv[4]) {
    const input_type = process.argv[4].toLowerCase();
    if (["raw", "flat"].includes(input_type)) {
      svg_type = input_type;
    } else {
      console.error(`Invalid svg type ${process.argv[4]}`);
      process.exit(1);
    }
  }

  const files = fs.readdirSync(source_path, "utf-8");
  const filetype_re = RegExp(`.*\.${file_type}$`);

  for (let file of files) {
    // Only matching filetypes!
    if (!file.match(filetype_re)) continue;

    let folder = getWeightFromFilename(file);
    await transformAndRelocateFile(file, folder);
  }
}

function getWeightFromFilename(filename) {
  const filename_parts = filename.split(`.${file_type}`)[0].split("-");
  const weight_or_last_identifier = filename_parts.slice(-1)[0];
  switch (weight_or_last_identifier) {
    case "thin":
    case "light":
    case "bold":
    case "fill":
    case "duotone":
      return weight_or_last_identifier;
    default:
      return "regular";
  }
}

async function transformAndRelocateFile(file_name, folder_name) {
  const old_path = path.join(source_path, file_name);
  const folder_path = path.join(source_path, folder_name);
  const new_path = path.join(folder_path, file_name);

  // Replace literal black "#000" with "currentColor"
  const color_literal_re = /#0+/g;
  const color_literal_replacer = new Transform({
    // NOTE: this may be flaky due to chunks split in the middle of a color literal!
    // Though unlikely due to default `highWaterMark` of 64kb, it is totally possible
    // for smaller chunks to be emitted. We can revert to a synchronous transform if needed.
    transform(chunk, _encoding, callback) {
      const replaced = chunk
        .toString()
        .replaceAll(color_literal_re, "currentColor");
      callback(null, replaced);
    },
  });

  // Append `fill="currentColor"` attribute to <svg> node
  const svg_opening_tag_re = /<svg ([^>]*)>/g;
  const svg_fill_injector = new Transform({
    // NOTE: this may be flaky due to chunks split in the middle of a color literal!
    // Though unlikely due to default `highWaterMark` of 64kb, it is totally possible
    // for smaller chunks to be emitted. We can revert to a synchronous transform if needed.
    transform(chunk, _encoding, callback) {
      const replaced = chunk
        .toString()
        .replace(svg_opening_tag_re, `<svg $1 fill="currentColor">`);
      callback(null, replaced);
    },
  });

  // Make directory if needed
  if (!fs.existsSync(folder_path) || !fs.lstatSync(folder_path).isDirectory()) {
    fs.mkdirSync(folder_path);
  }

  console.log(`${new_path}`);

  return new Promise((resolve, reject) => {
    const read_stream = fs.createReadStream(old_path);
    const write_stream = fs.createWriteStream(new_path);

    read_stream.on("error", reject);
    write_stream.on("error", reject);
    color_literal_replacer.on("error", reject);
    svg_fill_injector.on("error", reject);
    read_stream.on("close", () => {
      // fs.unlink(oldPath, (err) => {
      //   if (err) reject(err);
      //   resolve();
      // });
      resolve(void 0);
    });

    if (file_type === "png") {
      read_stream.pipe(write_stream);
    } else {
      if (svg_type === "raw") {
        read_stream.pipe(color_literal_replacer).pipe(write_stream);
      } else {
        read_stream.pipe(svg_fill_injector).pipe(write_stream);
      }
    }
  });
}
