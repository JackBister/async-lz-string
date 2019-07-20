module.exports = {
    devtool: 'source-map',
    entry: [
        __dirname + '/src/async-lz-string.ts'
    ],
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },
    output: {
        path: __dirname + '/libs',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}
