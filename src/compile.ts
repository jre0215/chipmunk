import { argv } from 'node:process';

import { compileChipmunkFileToJavaScript } from "./codegen.js";

for (const path of argv.slice(2)) {
  compileChipmunkFileToJavaScript(path);
}
