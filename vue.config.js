const path = require("path");
const DashboardPlugin = require('webpack-dashboard/plugin');
const vConsolePlugin = require('vconsole-webpack-plugin'); // 引入 移动端模拟开发者工具 插件 （另：https://github.com/liriliri/eruda）
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;//Webpack包文件分析器
const Jarvis = require("webpack-jarvis");//展示打包后文件大小
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); 这个不能压缩es6故用下面的插件
const TerserPlugin = require('terser-webpack-plugin');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
//CSS_使用purifycss-webpack来实现Tree Shaking
const glob = require('glob');
const PurifyCssWebpack  = require('purifycss-webpack');

module.exports = {
  // 基本路径
  /* 部署生产环境和开发环境下的URL：可对当前环境进行区分，baseUrl 从 Vue CLI 3.3 起已弃用，要使用publicPath */
  /* baseUrl: process.env.NODE_ENV === 'production' ? './' : '/' */
  publicPath: process.env.NODE_ENV === "production" ? "./" : "./",
  // 输出文件目录
  outputDir: "dist",
  // eslint-loader 是否在保存的时候检查
  lintOnSave: true,
  // use the full build with in-browser compiler?
  // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
  //   compiler: false,
  runtimeCompiler: true, //关键点在这
  // 调整内部的 webpack 配置。
  // 查阅 https://github.com/vuejs/vue-doc-zh-cn/vue-cli/webpack.md
  // webpack配置
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: () => {
  },

  configureWebpack: config => {  // 覆盖webpack默认配置的都在这里
    console.log(config,'默认配置');
    //生产and测试环境
    let pluginsPro = [
      //	Webpack包文件分析器(https://github.com/webpack-contrib/webpack-bundle-analyzer)
      new BundleAnalyzerPlugin(),
      new DashboardPlugin(),
      new CleanWebpackPlugin (), // 清空dist文件夹
      new PurifyCssWebpack({
        paths:glob.sync(path.join(__dirname,'src/*.html'))
      })
    ];
    //开发环境
    let pluginsDev = [
      new DashboardPlugin(),
      new Jarvis({
        port: 1337 // optional: set a port
      }),
      new HappyPack({
        //用id来标识 happypack处理那里类文件
        id: 'happyBabel',
        //如何处理  用法和loader 的配置一样
        loaders: [{
          loader: 'babel-loader?cacheDirectory=true',
        }],
        //共享进程池
        threadPool: happyThreadPool,
        //允许 HappyPack 输出日志
        verbose: true,
      }),
      //移动端模拟开发者工具(https://github.com/diamont1001/vconsole-webpack-plugin  https://github.com/Tencent/vConsole)
      new vConsolePlugin({
        filter: [], // 需要过滤的入口文件
        enable: true // 发布代码前记得改回 false,如果允许测试开发环境出现vconsole,可以选择不修改
      }),
    ];
    if(process.env.NODE_ENV === 'production') { // 为生产环境修改配置...process.env.NODE_ENV !== 'development'
      config.plugins = [...config.plugins, ...pluginsPro];
      config.optimization= {
        minimize: true, // 压缩
        minimizer:[ // 允许你通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)。
          new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: true, // Must be set to true if using source-maps in production
            terserOptions: {
              // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            }
          })]
        //   Or, as function:
        //   (compiler) => {
        //     const TerserPlugin = require('terser-webpack-plugin');
        //     new TerserPlugin({ /* your config */ }).apply(compiler);
        //   }
      }
    } else {
      // 为开发环境修改配置...
      config.plugins = [...config.plugins, ...pluginsDev];
    }
    console.log(config,'自定义配置');
  },
  // vue-loader 配置项
  // https://vue-loader.vuejs.org/en/options.html
  // vueLoader: {},
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  // css相关配置
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    // extract: true, //注释css热更新生效
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {},
    // 启用 CSS modules for all css / pre-processor files.
    requireModuleExtension: false
  },
  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: require("os").cpus().length > 1,
  // 是否启用dll
  // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#dll-mode
  // dll: false,
  // PWA 插件相关配置
  // see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {},
  // webpack-dev-server 相关配置
  devServer: {
    /* 自动打开浏览器 */
    open: true,
    // host: "192.168.0.137",
    host: "0.0.0.0", //局域网和本地访问
    //host: "192.168.1.137",
    port: 8080,
    https: false,
    hotOnly: false,
    /* 使用代理 */
    proxy: {
      "/api": {
        /* 目标代理服务器地址 */
        // target: "http://192.168.0.106:8080/",
        target: "http://192.168.1.126:8080/", //阳洋
        /* 允许跨域 */
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    },
    before: () => {
    }
  },
  // 第三方插件配置
  pluginOptions: {}
};
