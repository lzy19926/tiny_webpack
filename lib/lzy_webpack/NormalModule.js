const SparkMD5 = require('spark-md5')


// 定义一个生成好的模块对象Module
// 这个Module会在MoudleFactory的各个hook插件中进行流转
class NormalModule {

    constructor(params) {

        const {
            filePath,
            dependencies,
            loaders,
            generator,
            parser,
            resolver,
        } = params

        this.filePath = filePath          // 模块路径
        this.dependencies = dependencies  // 依赖项
        this.loaders = loaders            // loaders
        this.generator = generator        // 代码生成器
        this.parser = parser              // ast解析器
        this.resolver = resolver          // 路径解析器


        this.sourceCode = undefined       // 结果代码
        this.isDone = false               // 流转标记,是否完成模块化构建
        this._sourceSize = 0              // 资源大小
        this._hash = undefined            // 模块hash值
        this._ast = null                  // 生成的ast(中间产物)
    }

    // 获取模块大小
    size() {

    }

    // 计算模块size
    updateSize() {
        this._sourceSize = Buffer.from(this.sourceCode, 'utf8').length; // 资源大小
        return this._sourceSize
    }
    // 计算模块hash(用于热更新)
    updateHash() {
        this._hash = SparkMD5.hash(this.sourceCode);; // hash
        return this._hash
    }

    // 执行loader(需要重构)
    runLoaders(sourceCode) {

        const rules = this.loaders

        if (!rules) return sourceCode

        let resultCode = sourceCode
        // 遍历rules 如果尾缀符合  则调用其中的loader 处理字符串
        rules.forEach((rule) => {
            if (rule.test.test(this.filePath)) {
                rule.use.forEach((loader) => {
                    resultCode = loader(sourceCode)
                })
            }
        })

        return resultCode
    }

    // 调用javaScriptGenetaror生成模块代码
    codeGeneration() {
        const source = this.generator.generate()

    }
}


module.exports = NormalModule


