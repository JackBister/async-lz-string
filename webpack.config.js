const { join } = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    "async-lz-string": join(__dirname, "src", "async-lz-string.ts"),
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
  output: {
    libraryTarget: "umd",
    path: join(__dirname, "libs"),
    filename: "[name].js",
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
