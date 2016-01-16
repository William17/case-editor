const path = require('path');
const webpack = require('webpack');

const PATH = {
  src: path.join(__dirname, '/src'),
  build: path.join(__dirname, '/build')
};

module.exports = {
  entry: PATH.src + '/editor.js',
  output: {
    path: PATH.build,
    publicPath: 'http://localhost:8080/build/',
    filename: 'case-editor.js',
    library: 'CaseEditor',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    noParse: [],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: PATH.src,
        query: {
          stage: 0
        }
      },
      {
        test: /\.less$/,
        loaders: ['style', 'css', 'less']
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      },
      {
        test: /\.html$/,
        loader: 'html'
      },
      {
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader : 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devtool: 'source-map',
  devServer: {
    hot: true,
    inline: true
  }
};