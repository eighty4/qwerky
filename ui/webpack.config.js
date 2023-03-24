const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = (env, argv) => {

    const plugins = [
        new HtmlWebpackPlugin({
                template: 'qwerky.index.html',
                title: process.env.QWERKY_UI === 'dev' ? 'Qwerky (dev)' : 'Qwerky',
            },
        ),
        new HTMLInlineCSSWebpackPlugin(),
    ]

    if (argv.mode === 'production') {
        plugins.push(new MiniCssExtractPlugin())
    }

    return {
        entry: {
            'qwerky.bg': './qwerky.bg.js',
            'qwerky.ui': './qwerky.ui.js',
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.styl$/i,
                    use: [
                        argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        'stylus-loader',
                    ],
                },
            ],
        },
        plugins,
        optimization: {minimizer: ['...', new CssMinimizerPlugin()]},
        devServer: {port: 5395},
        mode: 'development',
    }
}
