import fs from "node:fs/promises";
import path from "node:path";
import { runIngest } from "../src/lib/ingest";

const OUT_DIR = path.join(process.cwd(), "public", "data");

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const { districtsFile, citywideFile, metaFile, citationsFile, boundaries } = await runIngest();
  await Promise.all([
    fs.writeFile(path.join(OUT_DIR, "council-districts.geojson"), JSON.stringify(boundaries)),
    fs.writeFile(path.join(OUT_DIR, "districts.json"), JSON.stringify(districtsFile, null, 2)),
    fs.writeFile(path.join(OUT_DIR, "citywide.json"), JSON.stringify(citywideFile, null, 2)),
    fs.writeFile(path.join(OUT_DIR, "meta.json"), JSON.stringify(metaFile, null, 2)),
    fs.writeFile(path.join(OUT_DIR, "citations-citywide.json"), JSON.stringify(citationsFile, null, 2)),
  ]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
