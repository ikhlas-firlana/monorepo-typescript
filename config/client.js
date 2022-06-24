require('dotenv').config({ path: `${process.cwd()}/.env` });

const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const compiler = require('../compiler.json');
const outdir = path.resolve(__dirname, '..') + '/dist';

const handler = async (env) => {
  if (env?.source && compiler[env?.source]?.client) {
    const htmlPath = `${path.resolve(__dirname, '..')}/src/packages/${env?.source}/client/index.html`;
    const excludeFiles = fs.readdirSync(path.resolve(__dirname, '..') + '/src/packages')
      .filter((val) => val !== env.source)
      .map((val) => `${path.resolve(__dirname, '..')}/src/packages/${val}/**`);

    const options = {
      entry: compiler[env?.source].client,
      mode: process.env.WEBPACK_MODE || 'production',
      name: String(`${env?.source}:client`).toUpperCase(),
      dependencies: [String(`${env?.source}:server`).toUpperCase()],
      target: 'web',
      output: {
        path: `${outdir}/${env?.source}/client`,
        publicPath: '/',
        filename: 'js/[name].[contenthash:8].js',
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            use: ['babel-loader'],
            exclude: /node_modules/,
          },
          {
            test: /\.css$/i,
            use: [process.env.WEBPACK_MODE === 'production' ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
          },
          {
            test: /\.(png|jpeg|jpg|gif)$/,
            type: 'asset/resource',
            generator: {
              filename: 'images/[name][ext]',
            },
          },
          {
            test: /\.(woff|woff2|eot|ttf|svg)$/,
            type: 'asset/resource',
            generator: {
              filename: 'fonts/[name][ext]',
            },
          },
        ],
      },
      optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
      },
      plugins: [
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [`${outdir}/${env?.source}/client`],
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
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        }),
      ],
      resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      },
      stats: process.env.WEBPACK_MODE === 'development' ? 'minimal' : 'normal',
      watch: process.env.WEBPACK_MODE === 'development',
      watchOptions: excludeFiles.length !== 0 ? {ignored: excludeFiles} : {},
      ...(process.env.WEBPACK_MODE === 'development' ? {devtool: 'cheap-module-source-map'} : {}),
    };

    if (fs.existsSync(htmlPath)) {
      options.plugins.push(
        new HtmlWebpackPlugin({
          inject: true,
          title: String(env?.source).toUpperCase(),
          template: htmlPath,
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
