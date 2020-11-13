import { join } from 'path';

import alias from 'rollup-plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import nodeGlobals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';

const builtInsPath = join('rollup-plugin-node-builtins', 'src', 'es6');

const nodeLib = id => require.resolve(join(builtInsPath, id));

const stubs = {};
[
  'path',
  'fs',
  'http',
  'https',
  'url',
  'querystring',
].forEach((id) => {
  stubs[id] = require.resolve(join(builtInsPath, 'empty'));
});

const nodeBuiltins = {
  process: require.resolve('process-es6'),
  buffer: require.resolve('buffer-es6'),
  events: nodeLib('events'),
  stream: nodeLib('stream'),
  util: nodeLib('util'),
  zlib: nodeLib('zlib'),
  string_decoder: nodeLib('string-decoder'),
};

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  plugins: [
    alias({
      ...stubs,
      ...nodeBuiltins,
    }),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    nodeGlobals(),
    builtins()
  ],
  onwarn(warning) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`);
    }
  },
};
