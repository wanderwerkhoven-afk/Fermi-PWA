import fs from "node:fs/promises";
import path from "node:path";

const source = path.resolve("node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const targetDir = path.resolve("public/vendor/pdfjs");
const target = path.join(targetDir, "pdf.worker.min.mjs");

await fs.mkdir(targetDir, { recursive: true });
await fs.copyFile(source, target);

console.log("PDF.js worker prepared:", path.relative(process.cwd(), target));
