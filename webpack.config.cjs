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
    "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8000/#authorize";
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

  canisters = network === "local" ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
}
initCanisterIds();

const isDevelopment = true; // process.env.NODE_ENV !== "production";
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
        options: {
          loader: "tsx", // Or 'ts' if you don't need tsx
          target: "ES2020",
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: path.resolve(__dirname, "src/modclub_assets/src"),
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          "resolve-url-loader",
          // Compiles Sass to CSS
          "sass-loader",
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
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "src", "modclub_assets", "assets"),
          to: path.join(__dirname, "dist", "modclub_assets"),
        },
      ],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      MODCLUB_CANISTER_ID: canisters["modclub"],
      MODCLUB_DEV_CANISTER_ID: canisters["modclub_dev"],
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
        target: "http://localhost:8000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
    hot: true,
    contentBase: path.resolve(__dirname, "./src/modclub_assets"),
    watchContentBase: true,
    historyApiFallback: true,
  },
};
