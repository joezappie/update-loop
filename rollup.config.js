import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/UpdateLoop.js',
  output: {
    file: 'dist/update-loop.js',
    format: 'umd',
    name: 'UpdateLoop'
  },
  plugins: [nodeResolve()]
};
