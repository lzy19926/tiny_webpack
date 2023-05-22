const { compressByUMinify, compressByUglify, justBeautifly } = require('../../lzy_webpack/compressCode')

// 用于构建Manifest依赖图的插件
class CodeCompressPlugin {
    constructor() { }

    //! 处理代码后续配置
    async compressCode(compilation) {
        let result = compilation.buildProcessCode
        const config = compilation.config

        //todo 生产模式进行代码压缩  默认不压缩
        if (config.mode === 'production') {
            result = compressByUglify(result)
        } else if (config.mode === 'development') {
            result = result
        } else {
            result = justBeautifly(result)
        }

        compilation.buildProcessCode = result
    }

    run(optionApplyer) {
        const handler = this.compressCode.bind(this)
        optionApplyer.hooks.ApplySync.tap("CodeCompressPlugin", handler)
    }
}

module.exports = CodeCompressPlugin