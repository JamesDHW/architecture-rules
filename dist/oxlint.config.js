import { fileURLToPath } from "node:url";
import { createConfig } from "./core/createConfig.js";
export default createConfig({
    pluginSpecifier: fileURLToPath(new URL("./plugin.js", import.meta.url)),
});
//# sourceMappingURL=oxlint.config.js.map