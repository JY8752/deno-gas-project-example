// ref: https://github.com/proudust/gas-deno-starter/blob/master/_build.ts
import { GasPlugin } from "npm:esbuild-gas-plugin@0.9.0";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";
import * as esbuild from "npm:esbuild@0.25.4";

const packageName = Deno.args[0];

await esbuild.build({
  plugins: [...denoPlugins(), GasPlugin as unknown as esbuild.Plugin],
  entryPoints: [packageName],
  outfile: `./dist/out.js`,
  bundle: true,
  format: "esm",
  target: "es2015",
});

await Deno.copyFile("appsscript.json", "dist/appsscript.json");
