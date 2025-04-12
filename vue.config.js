const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // publicPath: '/tuneup/', // <-- set the base path to '/tuneup/'
  transpileDependencies: true,
  devServer: {
    port: 8080, // Change this to your desired port number
  },
  
})
