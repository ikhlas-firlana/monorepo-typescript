const path = require('path');
const fs = require('fs');
const NodemonPlugin = require('nodemon-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const compiler = require('../compiler.json');
const outdir = path.resolve(__dirname, '..') + '/dist';

const handler = (env) => {
  if (env?.source && compiler[env?.source]?.server) {
    const excludeFiles = fs.readdirSync(path.resolve(__dirname, '..') + '/src/packages')
      .filter((val) => val !== env.source)
      .map((val) => `${path.resolve(__dirname, '..')}/src/packages/${val}/**`);

    const options = {
      entry: {
        ...compiler[env?.source]?.server,
      },
      mode: process.env.WEBPACK_MODE || 'production',
      name: String(`${env?.source} server`).toUpperCase(),
      target: 'node',
      output: {
        path: `${outdir}/${env?.source}`,
      },
      module: {
        rules: [
          {
            test: /\.ts?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
          },
        ],
      },
      externals: [nodeExternals()],
      optimization: {
        nodeEnv: false,
      },
      plugins: [
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [`${outdir}/${env?.source}`],
        }),
        new ForkTsCheckerWebpackPlugin({
          issue: {
            exclude: excludeFiles.map((file) => ({ file })),
          },
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
            mode: 'write-references',
          },
        }),
      ],
      resolve: {
        extensions: ['.ts'],
      },
      stats: {
        modules: false,
      },
      watch: process.env.WEBPACK_MODE === 'development',
      watchOptions: excludeFiles.length !== 0 ? {ignored: excludeFiles} : {},
      devtool: process.env.WEBPACK_MODE === 'development' ? 'eval' : 'source-map',
    };

    if (process.env.WEBPACK_MODE === 'development' && process.env.NODEMON === 'true' && env?.exec) {
      options.plugins.push(
        new NodemonPlugin({
          script: `${outdir}/${env?.source}/${env?.exec}`,
          watch: [`${outdir}/${env?.source}`, `${path.resolve(__dirname, '..')}/src/packages/${env?.source}`],
          ignore: [
            `${outdir}/${env?.source}/client`,
            `${path.resolve(__dirname, '..')}/src/packages/${env?.source}/client`,
            ...excludeFiles,
          ]
        }),
      );
    }

    return options;
  }
  return {
    stats: 'none',
  }
};

module.exports = handler;
