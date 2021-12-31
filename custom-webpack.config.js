const path = require("path");
const webpack = require("webpack");

let localCanisters, prodCanisters, canisters;

function initCanisterIds() {

  try {
    localCanisters = require(path.resolve("backend",".dfx", "local", "canister_ids.json"));
    console.log('>>',localCanisters)
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

//for @angular-builders/custom-webpack
//just the Plugins and configs needed for the IC build process
module.exports = {
  node: { global: true}, // Fix: "Uncaught ReferenceError: global is not defined".
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      BACKEND_CANISTER_ID: canisters["backend"]
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
  ],
  // proxy /api to port 8000 during development
  devServer: {
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
    contentBase: path.resolve(__dirname, "../src/app"),
    watchContentBase: true
  },
};
