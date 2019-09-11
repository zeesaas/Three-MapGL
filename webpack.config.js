const path = require('path');
const pluginsConfig = require("./webpack.plugins.js");
module.exports = {
  entry: {
    community: './src/scene/community.js',
    home: './src/scene/home.js',
    test: './src/scene/test.js',
    basic: './src/scene/basic.js',
    bloom: './src/scene/bloom.js',
    store: './src/scene/store.js'
  },
  mode: "development",
  plugins: pluginsConfig,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ["@babel/plugin-proposal-class-properties", { "loose" : true }],
            ]
          }
        }
      }
    ]
  },
  devServer: {
    host: '0.0.0.0',
    port: '8033',
    disableHostCheck: true, // 取消host检查
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'map')
  }
};