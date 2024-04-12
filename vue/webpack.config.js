var path = require('path');
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));

module.exports = (env, options) => {

	exports = {
		entry: path.resolve(__dirname, 'main.js'),
		output: {
			path: path.resolve(__dirname, '../amd/build'),
			publicPath:  '/dist/',
			filename: 'app-lazy.min.js',
			chunkFilename: "[id].app-lazy.min.js?v=[hash]",
			libraryTarget: 'amd',
			pathinfo: false, // new
		},
		module: {
			rules: [{
				test: /\.js?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}, {
				test: /\.(sa|sc|c)ss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader'
				]
			}, {
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						scss: 'vue-style-loader!css-loader!sass-loader'
					}
				}
			}]
		},
		resolve: {
			alias: {
				'vue$': 'vue/dist/vue.esm.js'
			},
			extensions: ['.*', '.js', '.vue', '.json']
		},
		devServer: {
			historyApiFallback: true,
			noInfo: true,
			overlay: true,
			headers: {
				'Access-Control-Allow-Origin': '\*'
			},
			disableHostCheck: true,
			https: true,
			public: 'https://127.0.0.1:8080',
			hot: true,
		},
		performance: {
			hints: false
		},
		devtool: (isDevServer ? '#eval-source-map' : false),
		plugins: [
			/*
			new BundleAnalyzerPlugin({
				analyzerMode: 'server',
				generateStatsFile: true,
				statsOptions: { source: false }
			  }),
			*/
			new VueLoaderPlugin(),
			new FileManagerPlugin({
				events: {
					onStart: {
						delete: [
							{
								source: path.resolve(__dirname, '../amd/src/app-lazy.js'),
								options: {force: true},
							},
							{
								source: path.resolve(__dirname, '../amd/build/app-lazy.min.js'),
								options: {force: true},
							},
						],
					},
					onEnd: {
						copy: [
							{
								source: path.resolve(__dirname, '../amd/build'),
								destination: path.resolve(__dirname, '../amd/src')
							},
						],
						move: [
							{
								source: path.resolve(__dirname, '../amd/src/app-lazy.min.js'),
								destination: path.resolve(__dirname, '../amd/src/app-lazy.js')
							},
						],
						delete: [
							{
								source: path.resolve(__dirname, '../amd/src/app-lazy.min.js'),
								options: {force: true},
							},
						],
					},
				},
			}),
		],
		watchOptions: {
			ignored: /node_modules/
		},
		externals: {
			'core/ajax': {
				amd: 'core/ajax'
			},
			'core/str': {
				amd: 'core/str'
			},
			'core/modal_factory': {
				amd: 'core/modal_factory'
			},
			'core/modal_events': {
				amd: 'core/modal_events'
			},
			'core/fragment': {
				amd: 'core/fragment'
			},
			'core/yui': {
				amd: 'core/yui'
			},
			'core/localstorage': {
				amd: 'core/localstorage'
			},
			'core/notification': {
				amd: 'core/notification'
			},
			'jquery': {
				amd: 'jquery'
			}/*,
			'jqueryui': {
				amd: 'jqueryui'
			}*/
		}
	};

	if (options.mode === 'production') {
		exports.devtool = false;
		// http://vue-loader.vuejs.org/en/workflow/production.html
		exports.plugins = (exports.plugins || []).concat([
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: '"production"'
				}
			}),
			new webpack.LoaderOptionsPlugin({
				minimize: true
			})
		]);
		exports.optimization = {
			minimizer: [
				new TerserPlugin({
					parallel: true,
					terserOptions: {
						mangle: true,
						keep_fnames: false,
						toplevel: true,
					}
				  }),
			]
		}
	}

	return exports;
};