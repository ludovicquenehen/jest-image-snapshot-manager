import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  snapshotPathTemplate: "{testDir}/__image_snapshots__/__received_output__/{arg}{ext}",
});
