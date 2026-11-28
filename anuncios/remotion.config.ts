import { Config } from "@remotion/cli/config";
import { resolve } from "node:path";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(2);
Config.setOverwriteOutput(true);
// Webpack must stay inside the workspace in the sandbox.  Otherwise it follows
// parent node_modules folders that are intentionally unreadable there.
Config.setCachingEnabled(false);
Config.overrideWebpackConfig((current) => ({
  ...current,
  cache: false,
  resolve: {
    ...current.resolve,
    modules: [resolve(process.cwd(), "node_modules")],
    symlinks: false,
  },
}));
