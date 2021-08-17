module.exports = {
  entry: __dirname + '/src/index.tsx',
  module: {
    rules: [{
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
    }],
  },
  resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'main.js'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist'
  }
};
