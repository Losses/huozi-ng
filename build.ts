import { rm } from "fs/promises";

console.log("🧹 Cleaning dist...");
await rm("dist", { recursive: true, force: true });

console.log("🏗️  Building library...");
await Bun.build({
  entrypoints: ["src/index.ts", "src/core/index.ts", "src/react/index.ts"],
  outdir: "dist",
  target: "browser",
  external: ["react", "react-dom"],
  sourcemap: "linked",
  minify: false, // Library usually doesn't need minify, let consumer do it. But maybe true for small size. I'll leave false for debuggability.
});

console.log("📝 Generating types...");
const tscProc = Bun.spawn(["bun", "x", "tsc", "-p", "tsconfig.build.json"], {
    stdout: "inherit",
    stderr: "inherit"
});
await tscProc.exited;

console.log("✅ Build complete.");