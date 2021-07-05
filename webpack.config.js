const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: {
    "async-lz-string": __dirname + "/src/async-lz-string.ts",
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
  output: {
    library: "LIB",
    libraryTarget: "var",
    path: __dirname + "/libs",
    filename: "[name].js",
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new EsmWebpackPlugin()
  ]
};
