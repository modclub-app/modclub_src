const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const ROOT_DIR = __dirname + "/../../";

let localCanisters, prodCanisters, canisters, network;

function initCanisterIds() {
  try {
    localCanisters = require(path.resolve(
      ROOT_DIR,
      ".dfx",
      "local",
      "canister_ids.json"
    ));
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = require(path.resolve(ROOT_DIR, "canister_ids.json"));
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === "production" ? "ic" : "local");

  canisters = network === "local" ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
}
initCanisterIds();

function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed in JS
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}-${hour}.${minute}`;
}

// See readme of https://github.com/dfinity/internet-identity.
// For some reason, we need different urls for different browsers.
let LOCAL_II_CANISTER = "";
let LOCAL_II_CANISTER_SAFARI = "";
try {
  LOCAL_II_CANISTER_SAFARI =
    network === "local"
      ? `http://localhost:8000/?canisterId=${process.env["INTERNET_IDENTITY_CANISTER_ID"]}`
      : `https://identity.ic0.app`;
  LOCAL_II_CANISTER =
    network === "local"
      ? `http://${process.env["INTERNET_IDENTITY_CANISTER_ID"]}.localhost:8000`
      : `https://identity.ic0.app`;
} catch (e) {
  console.error("Error setting LOCAL_II_CANISTER: ", e);
  LOCAL_II_CANISTER =
    "http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai";
  LOCAL_II_CANISTER_SAFARI =
    "http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai";
}
const isDevelopment = process.env.NODE_ENV !== "production";
const asset_entry = path.join("src", "modclub_assets", "app", "index.html");

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    // The frontend.entrypoint points to the HTML file for this build, so we need
    // to replace the extension to `.js`.
    index: path.join(ROOT_DIR, asset_entry).replace(/\.html$/, ".tsx"),
  },
  devtool: isDevelopment ? "source-map" : false,
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: "all",
      /**
       * We must to splits bundle into chunks if it exceed 2Mb size
       * otherwise we will have "Replica Error: application payload size (...) cannot be larger than 3145728"
       */
      maxSize: 1024000,
    },
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify/"),
      util: require.resolve("util/"),
      fs: false,
    },
    symlinks: false,
  },
  output: {
    filename: "[name].js",
    path: path.join(ROOT_DIR, "dist", "modclub_assets"),
    chunkFilename: "[name].[contenthash].js",
    clean: true, // Cleans the /dist folder before each build
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        loader: "esbuild-loader",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: path.resolve(ROOT_DIR, "src/modclub_assets/app"),
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|ico|svg|woff|woff2|eot|ttf)$/i,
        include: path.resolve(ROOT_DIR, "src/modclub_assets/assets"),
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        include: path.resolve(ROOT_DIR, "src/modclub_assets/app"),
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new CompressionPlugin({
      test: /\.(js|map)(\?.*)?$/i,
      algorithm: "gzip",
    }),
    new HtmlWebpackPlugin({
      template: path.join(ROOT_DIR, asset_entry),
      cache: false,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      MODCLUB_ASSET_OLD_CANISTER_ID: "ljyte-qiaaa-aaaah-qaiva-cai",
      CANISTER_ID_MODCLUB: canisters["modclub"] || "aaaaa-aa",
      CANISTER_ID_MODCLUB_DEV: canisters["modclub_dev"] || "aaaaa-aa",
      CANISTER_ID_MODCLUB_QA: canisters["modclub_qa"] || "aaaaa-aa",
      CANISTER_ID_WALLET: canisters["wallet"] || "aaaaa-aa",
      CANISTER_ID_WALLET_DEV: canisters["wallet_dev"] || "aaaaa-aa",
      CANISTER_ID_WALLET_QA: canisters["wallet_qa"] || "aaaaa-aa",
      CANISTER_ID_RS: canisters["rs"] || "aaaaa-aa",
      CANISTER_ID_RS_DEV: canisters["rs_dev"] || "aaaaa-aa",
      CANISTER_ID_RS_QA: canisters["rs_qa"] || "aaaaa-aa",
      CANISTER_ID_VESTING: canisters["vesting"] || "aaaaa-aa",
      CANISTER_ID_VESTING_DEV: canisters["vesting_dev"] || "aaaaa-aa",
      CANISTER_ID_VESTING_QA: canisters["vesting_qa"] || "aaaaa-aa",
      CANISTER_ID_AIRDROP: canisters["airdrop"] || "aaaaa-aa",
      CANISTER_ID_AIRDROP_DEV: canisters["airdrop_dev"] || "aaaaa-aa",
      CANISTER_ID_AIRDROP_QA: canisters["airdrop_qa"] || "aaaaa-aa",
      DECIDEID_CANISTER_ID: canisters["decideid"] || "aaaaa-aa",
      DECIDEID_DEV_CANISTER_ID: canisters["decideid_dev"] || "aaaaa-aa",
      DECIDEID_QA_CANISTER_ID: canisters["decideid_qa"] || "aaaaa-aa",
      CANISTER_ID_DECIDEID_ASSETS: canisters["decideid_assets"] || "aaaaa-aa",
      CANISTER_ID_DECIDEID_DEV_ASSETS:
        canisters["decideid_dev_assets"] || "aaaaa-aa",
      CANISTER_ID_DECIDEID_QA_ASSETS:
        canisters["decideid_qa_assets"] || "aaaaa-aa",
      LOCAL_II_CANISTER,
      LOCAL_II_CANISTER_SAFARI,
      DFX_NETWORK: process.env.DFX_NETWORK || "local",
      DEV_ENV: process.env.DEV_ENV || "production",
      DEPLOYMENT_TAG:
        process.env.DEPLOYMENT_TAG ||
        `${process.env.DEV_ENV}-${getCurrentTimestamp()}`,
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
  ],
  // proxy /api to port 8000 during development
  devServer: {
    port: "9000",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
    hot: true,
    static: {
      directory: "./app/modclub_assets",
    },
    watchFiles: "./app/modclub_assets/**/*",
    historyApiFallback: true,
  },
};
