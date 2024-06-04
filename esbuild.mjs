/*global console*/
/*global process*/
import esbuild from 'esbuild';
import fs from 'node:fs';

let result = await esbuild.build({
  entryPoints: ['src/index.mts', 'src/cleanup.mts'],
  tsconfig: 'tsconfig.json',
  define: {
    "process.env.NODE_ENV": "\"production\""
  },
  bundle: true,
  minify: true,
  metafile : true,
  outExtension: { '.js': '.mjs' },
  platform: 'node',
  format: 'esm',
  target: 'node20.0',
  outdir: './dist/',
  treeShaking: true,
  inject: ['src/cjs-shim.ts']
});

// Analyze the generate file size contributions
if (process.env.SHOW_ANALYSIS === '1' || process.env.SHOW_ANALYSIS === 'true') {
  const meta = await esbuild.analyzeMetafile(result.metafile, {
    verbose: false,
  });

  console.log(meta.replace(/.+\/cache/g,''));
}

if (process.env.CREATE_METAFILE === '1' || process.env.CREATE_METAFILE === 'true') {
  fs.writeFileSync('dist/meta.json', JSON.stringify(result.metafile, null, 2));
}