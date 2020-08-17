module.exports = {
	mode: "production",
    entry: './assets/js/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'salmon.gusherjs.js'
    },
	module: {
		rules: [
			{
			test: /\.css/,
			use: [
				"style-loader",
				{
					loader: "css-loader",
					options: { url: false }
				}
			]
			}
		]
	}
};