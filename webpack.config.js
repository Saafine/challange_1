const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PRODUCTION = process.env.NODE_ENV.trim() === 'production';

let plugins = [
  new HtmlWebpackPlugin(
    {
      template: path.join(__dirname, 'src', 'index.html'),
      hash: true,
      favicon: path.join(__dirname, 'src', 'favicon.jpg')
    }
  )
];

let sourcemap;
if (PRODUCTION) { // Production only plugins
  console.log('Loading production only plugins...');
  sourcemap = false;
  plugins.push(new webpack.optimize.UglifyJsPlugin());
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }));
} else {
  sourcemap = 'cheap-module-source-map';
}

const cssIdentifier = '[hash:base64:10]';
const cssLoader = ['style-loader', 'css-loader?localIdentName=' + cssIdentifier];

module.exports = {
  devtool: sourcemap,
  context: path.join(__dirname, 'src'),
  entry: [
    'babel-polyfill', // this is required for redux-saga to work
    './app/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/challange_1' // point to the correct dir when url reached from external source
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'src'),
        query: { // presets for babel
          presets: ['react', 'es2015', 'stage-2'], // taken from packages.json
          plugins: ['react-html-attrs'] // change className into class
        }
        // exclude: /node_modules/
      }, {
        test: /\.(png|woff|woff2|eot|ttf|svg|jpg|gif)$/, // woff, eot, ttf, svg is neccessary to later include fontawesome
        loaders: ['url-loader?limit=10000&name=images/[hash:12].[ext]'],
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        loaders: cssLoader,
        exclude: /node_modules/
      }, {
        test: /\.scss/,
        loader: 'style-loader!css-loader!sass-loader'
      }]
  },
  devServer: {
    historyApiFallback: true, // 404 fallback -> redirect to root if path not found
    contentBase: path.join(__dirname, 'dist'),
    inline: true,
    stats: {
      colors: true,
      reasons: true,
      chunks: false
    }
  },
  plugins: plugins
};