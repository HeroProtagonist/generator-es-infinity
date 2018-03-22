const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const plugins = env === 'production'
? [
    new ExtractTextPlugin({
      filename: '[name].css'
    })
  ]
: []

const styleUse = env === 'production'
? ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [ 'css-loader', 'postcss-loader', 'sass-loader', ]
})
: [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader',  ]

module.exports = {
  mode: env,
  devtool: env === 'production' ? '' : 'cheap-module-source-map',
  // context: srcPath,
  entry: ENTRY,
  // {
    // logo:'./src/components/0-Logo/Logo.js',
    // two:'./src/components/1-ScopedSelectors/ScopedSelectors.js',
  // },
  output: OUTPUT,
  // {
  //   filename: '[name].js',
  //   path: path.resolve('./dist'),
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name (file) {
                if (env === 'development') {
                  return '[name].[ext]' // return '[path][name].[ext]'
                }

                return '[hash].[ext]'
              }
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: styleUse
      },
    ],
  },
  plugins,
}
