let path = require('path');

let conf = {
	entry: './src/',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'main.js',
		publicPath: 'dist/'
	},
	devServer: {
		overlay: true,
		index: 'index.html'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
	            exclude: /node_modules/,
	            loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
					]
			}
		]
	}
};

module.exports = (env, options) => {
	let production = options.mode === 'production';
	conf.devtool = production ? 'source-map' : 'eval-sourcemap';
	return conf;
}