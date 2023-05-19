const fs = require('fs')

// 用于读取文件内容  预处理的插件
class LoadeFileSourcePlugin {
    constructor() { }

    loadeFileSource(normalModule, callNext) {

        const fileContent = fs.readFileSync(normalModule.request, 'utf-8')

        const loadedCode = normalModule.runLoaders(fileContent) // todo 需要重构

        normalModule.sourceCode = loadedCode

        // 继续下个插件
        callNext()
    }

    //todo 将useCustomLoader方法注册到moduleFactory的create钩子队列  创建module时执行 
    run(moduleFactory) {
        const handler = this.loadeFileSource.bind(this)
        moduleFactory.hooks.create.tapAsync("LoadeFileSourcePlugin", handler)
    }
}

module.exports = LoadeFileSourcePlugin