
const path = require('path');
const webpack = require('webpack');


new webpack.DefinePlugin({
    '__static': `"${path.join(__dirname, '/static').replace(/\\/g, '\\\\')}"`
})