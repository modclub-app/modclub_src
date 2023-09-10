const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

let localCanisters, prodCanisters, canisters, network;

function initCanisterIds() {
  try {
    localCanisters = require(path.resolve(
      ".dfx",
      "local",
      "canister_ids.json"
    ));
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = require(path.resolve("canister_ids.json"));
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

let LOCAL_II_CANISTER = "";
try {
  // Replace this value with the ID of your local Internet Identity canister
  LOCAL_II_CANISTER =
    network === "local"
      ? `http://localhost:8000/?canisterId=${process.env["INTERNET_IDENTITY_CANISTER_ID"]}`
      : `https://identity.ic0.app`;
} catch (e) {
  console.error("Error setting LOCAL_II_CANISTER: ", e);
  LOCAL_II_CANISTER =
    "http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai";
}
const isDevelopment = process.env.NODE_ENV !== "production";
const asset_entry = path.join("src", "modclub_assets", "src", "index.html");

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    // The frontend.entrypoint points to the HTML file for this build, so we need
    // to replace the extension to `.js`.
    index: path.join(__dirname, asset_entry).replace(/\.html$/, ".tsx"),
  },
  devtool: isDevelopment ? "source-map" : false,
  optimization: {
    minimize: !isDevelopment,
    minimizer: [new TerserPlugin()],
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify/"),
      util: require.resolve("util/"),
    },
    symlinks: false,
  },
  output: {
    filename: "index.js",
    path: path.join(__dirname, "dist", "modclub_assets"),
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        loader: "esbuild-loader",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: path.resolve(__dirname, "src/modclub_assets/src"),
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
        include: path.resolve(__dirname, "src/modclub_assets/assets"),
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        include: path.resolve(__dirname, "src/modclub_assets/src"),
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, asset_entry),
      cache: false,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      MODCLUB_ASSET_OLD_CANISTER_ID: "ljyte-qiaaa-aaaah-qaiva-cai",
      MODCLUB_CANISTER_ID: canisters["modclub"] || "aaaaa-aa",
      MODCLUB_DEV_CANISTER_ID: canisters["modclub_dev"] || "aaaaa-aa",
      MODCLUB_QA_CANISTER_ID: canisters["modclub_qa"] || "aaaaa-aa",
      WALLET_CANISTER_ID: canisters["wallet"] || "aaaaa-aa",
      WALLET_DEV_CANISTER_ID: canisters["wallet_dev"] || "aaaaa-aa",
      WALLET_QA_CANISTER_ID: canisters["wallet_qa"] || "aaaaa-aa",
      RS_CANISTER_ID: canisters["rs"] || "aaaaa-aa",
      RS_DEV_CANISTER_ID: canisters["rs_dev"] || "aaaaa-aa",
      RS_QA_CANISTER_ID: canisters["rs_qa"] || "aaaaa-aa",
      VESTING_CANISTER_ID: canisters["vesting"] || "aaaaa-aa",
      VESTING_DEV_CANISTER_ID: canisters["vesting_dev"] || "aaaaa-aa",
      VESTING_QA_CANISTER_ID: canisters["vesting_qa"] || "aaaaa-aa",
      LOCAL_II_CANISTER,
      DFX_NETWORK: process.env.DFX_NETWORK || "local",
      DEV_ENV: process.env.DEV_ENV || "production",
      DEPLOYMENT_TAG: process.env.DEPLOYMENT_TAG,
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
      directory: "./src/modclub_assets",
    },
    watchFiles: "./src/modclub_assets/**/*",
    historyApiFallback: true,
  },
};
