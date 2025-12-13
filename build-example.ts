import { rm } from "fs/promises";
import path from "path";
import bunPluginTailwind from "bun-plugin-tailwind";

console.log("🧹 Cleaning dist/example...");
await rm("dist/example", { recursive: true, force: true });

console.log("🏗️  Building example...");
const buildResult = await Bun.build({
  entrypoints: ["example/src/main.tsx"],
  outdir: "dist/example",
  target: "browser",
  plugins: [bunPluginTailwind],
});

if (!buildResult.success) {
  console.error("Build failed");
  for (const message of buildResult.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("📄 Copying assets...");
const exampleDir = "dist/example";

// Copy logo.svg
await Bun.write(
  path.join(exampleDir, "logo.svg"),
  Bun.file("example/logo.svg")
);

// Process and copy index.html
const indexHtml = await Bun.file("example/index.html").text();
let newIndexHtml = indexHtml.replace(
  'src="./src/main.tsx"',
  'src="./main.js"'
);

// Add link to CSS if it was generated and not already linked
if (buildResult.outputs.some(o => o.path.endsWith(".css"))) {
    if (!newIndexHtml.includes("main.css")) {
        newIndexHtml = newIndexHtml.replace(
            "</head>",
            '    <link rel="stylesheet" href="./main.css" />\n  </head>'
        );
    }
}

await Bun.write(path.join(exampleDir, "index.html"), newIndexHtml);

console.log("✅ Example build complete.");
