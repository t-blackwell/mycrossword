const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  watch: true,
  mode: "development",
  devtool: "inline-source-map",
  entry: "./src/index.tsx",
  output: {
    library: 'mycrossword',
    libraryTarget: "umd",
    filename: "index.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
      "react/jsx-runtime": "react/jsx-runtime.js"
    }
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.scss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: { includePaths: ['src/'] }
            }
          }
        ],
      },
    ]
  },
  externals: {
    react: "react",
    "react-dom": "react-dom"
  },
};