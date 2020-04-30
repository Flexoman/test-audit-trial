const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const pckg = require("./package.json");

const {
  override,
  addWebpackAlias,
  addDecoratorsLegacy,
  addWebpackPlugin,
  disableEsLint,
  overrideDevServer,
  disableChunk,
  watchAll
} = require("customize-cra");

const overideOutput = ({ filename, chunkFilename }) => (config) => {
  if (filename) config.output.filename = filename;
  if (chunkFilename) config.output.chunkFilename = chunkFilename;
  return config
};

module.exports = {
  webpack: override(
    addDecoratorsLegacy(),
    disableEsLint(),
    addWebpackAlias({
      'react-dom': '@hot-loader/react-dom'
    }),
    disableChunk(),
    addWebpackPlugin((({ NODE_ENV, DEPLOY_ENV, BASE_URL }) => {
      var BASE_URS = {
        production: process.env.BASE_URL_PRODUCTION,
        staging: process.env.BASE_URL_STAGING,
        development: process.env.BASE_URL_DEVELOPMENT,
        test: process.env.BASE_URL_TEST,
        f1: process.env.BASE_URL_TEST_F1,
        f2: process.env.BASE_URL_TEST_F2,
      };
      process.env.BASE_URL = BASE_URS[DEPLOY_ENV] || BASE_URL;
      return new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        'process.env.DEPLOY_ENV': JSON.stringify(DEPLOY_ENV || 'development'),
        'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL)
      })
      })(process.env)
    ),
    overideOutput({
      filename: `${process.env.DEPLOY_ENV}/${pckg.version.replace(/\./g, '_')}/bundle.js`,
      chunkFilename: 'bundle.chank.js',
    }),
    addWebpackPlugin(
      new HtmlWebpackPlugin({
        filename: `${process.env.DEPLOY_ENV || 'development'}/${pckg.version.replace(/\./g, '_')}/index.html`,
        'meta': {
          'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
          'js-version': pckg.version,
        },
        template: './public/index.html',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: false,
          minifyURLs: true
        },
        cache: false,
      }),
    ),
    (config) => {
      console.log(`version: ${pckg.version}`)
      console.log(`deploy ENV: ${process.env.DEPLOY_ENV}`)
      console.log(`backend URL: ${process.env.BASE_URL}`)
      return config;
    }
  ),
  devServer: overrideDevServer(
    watchAll(),
    (config) => {
      console.log(`version: ${pckg.version}`)
      console.log(`backend URL: ${process.env.BASE_URL}`)
      return config;
    }
  )
};

