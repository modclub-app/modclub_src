const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

let LOCAL_II_CANISTER = "";
try {
  const config = require("./generated.config.json");
  // Replace this value with the ID of your local Internet Identity canister
  LOCAL_II_CANISTER = `http://${config["IDENTITY_CANISTER"]}.localhost:8000/#authorize`;
} catch (e) {
  LOCAL_II_CANISTER =
    "http://rwlgt-iiaaa-aaaaa-aaaaa-cai.localhost:8000/#authorize";
}

let localCanisters, prodCanisters, canisters;

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

  const network =
    process.env.DFX_NETWORK ||
    (process.env.NODE_ENV === "production" ? "ic" : "local");

  console.log("network: ", network);
  canisters = network === "local" ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
}
initCanisterIds();

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
      MODCLUB_CANISTER_ID:
        canisters["modclub"] || "la3yy-gaaaa-aaaah-qaiuq-cai",
      MODCLUB_DEV_CANISTER_ID:
        canisters["modclub_dev"] || "olc6u-lqaaa-aaaah-qcooq-cai",
      MODCLUB_QA_CANISTER_ID:
        canisters["modclub_qa"] || "f2xjy-4aaaa-aaaah-qc3eq-cai",
      WALLET_CANISTER_ID: canisters["wallet"] || "vxnwt-gyaaa-aaaah-qc7vq-cai",
      WALLET_DEV_CANISTER_ID:
        canisters["wallet_dev"] || "vxnwt-gyaaa-aaaah-qc7vq-cai",
      WALLET_QA_CANISTER_ID:
        canisters["wallet_qa"] || "vckh6-hqaaa-aaaah-qc7wa-cai",
      RS_CANISTER_ID: canisters["rs"] || "vflbk-kiaaa-aaaah-qc7wq-cai",
      RS_DEV_CANISTER_ID: canisters["rs_dev"] || "vflbk-kiaaa-aaaah-qc7wq-cai",
      RS_QA_CANISTER_ID: canisters["rs_qa"] || "vmikw-4aaaa-aaaah-qc7xa-cai",
      LOCAL_II_CANISTER,
      DFX_NETWORK: process.env.DFX_NETWORK || "local",
      DEV_ENV: process.env.DEV_ENV || "production",
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
