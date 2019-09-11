const webpack = require("webpack")
const path = require('path')
const htmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UglifyjsWebpackPlugin = require("uglifyjs-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin')

module.exports = [
  new webpack.HotModuleReplacementPlugin(),
  // 调用之前先清除 map 文件夹
  new CleanWebpackPlugin(),
  // 4.x之前可用uglifyjs-webpack-plugin用以压缩文件，4.x可用--mode更改模式为production来压缩文件
  new UglifyjsWebpackPlugin(),
  new CopyPlugin([{
      from: path.resolve(__dirname, "src/assets"),
      to: './static'
  }]),
  // 自动生成html模板
  new htmlWebpackPlugin({
    filename: "store.html",
    title: "store",
    chunks: ['store'],  // 按需引入对应名字的js文件
    template: "./src/views/store.html"
  }),
  new htmlWebpackPlugin({
    filename: "bloom.html",
    title: "bloom",
    chunks: ['bloom'],  // 按需引入对应名字的js文件
    template: "./src/views/bloom.html"
  }),
  new htmlWebpackPlugin({
      filename: "community.html",
      title: "community",
      chunks: ['community'],  // 按需引入对应名字的js文件
      template: "./src/views/community.html"
  }),
  new htmlWebpackPlugin({
      filename: "home.html",
      title: "home",
      chunks: ['home'],
      template: "./src/views/home.html"
  }),
  new htmlWebpackPlugin({
    filename: "basic.html",
    title: "basic",
    chunks: ['basic'],  // 按需引入对应名字的js文件
    template: "./src/views/basic.html"
}),
  new htmlWebpackPlugin({
    filename: "test.html",
    title: "test",
    chunks: ['test'],
    template: "./src/views/test.html"
  })
]