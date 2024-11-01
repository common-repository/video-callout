const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const fs = require( 'fs' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

// The directory where the components live.
const backendDir= './packages';

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry,
		...fs
			.readdirSync( `./${ backendDir}` )
			.reduce( ( acc, path ) => {
				acc[
					`${ backendDir}-${ path }`
				] = `./${ backendDir}/${ path }`;
				return acc;
			}, {} ),
	},
	output: {
		path: __dirname + "/../assets/pack",
		filename: ( pathData ) => {
			if ( ! pathData.chunk.name.includes( backendDir) ) {
				return '[name].js';
			}
			const dirname = pathData.chunk.name.replace(
				`${ backendDir}-`,
				''
			);

			return `${ dirname }/index.js`;
		},
	},
	plugins: [
		...defaultConfig.plugins,
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: '**/{block.json,*.php,*.css}',
					context: backendDir,
					noErrorOnMissing: true,
				},
			],
		} ),
	],
};

