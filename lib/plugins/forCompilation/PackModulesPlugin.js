
// 用于将多个Module的代码转化为浏览器端读取的modules对象字符串

class PackModulesPlugin {
    constructor() { }

    // 构建每个module为键值对 并添加进modules对象(所有资源都以字符串形式构建)
    //todo 注意  (1.处理模块为键值对 绝对路径为key 值保存模块的code和mapping)
    //todo 2. 模块的code应放在一个函数里 因为每个模块的code中使用了require,exports两个API 需要传入
    //todo 3 文件中的依赖是相对路径  需要使用绝对路径

    // 包装单个模块资源
    createModulesStr(compilation, callNext) {
        
        let modulesStr = '';
        let chunk = compilation.chunks.get("bundle.js")

        const modules = chunk.modules

        for (let [path, module] of modules) {

            compilation.renderProgressBar(`打包模块${path}`); //! ------------------------进度显示
            const key = JSON.stringify(path)
            const mapping = JSON.stringify(module.mapping)
            const code = `(require,module,exports)=>{
            ${module.sourceCode}
        } `

            const modulesPart = `${key}:[\n ${code},\n ${mapping} \n ],\n`
            modulesStr += modulesPart
        }

        chunk.code = `{${modulesStr}}`

        callNext()
    }

    run(compilation) {
        const handler = this.createModulesStr.bind(this)
        compilation.hooks.BundleSync.tapAsync("PackModulePlugin", handler)
    }
}

module.exports = PackModulesPlugin

