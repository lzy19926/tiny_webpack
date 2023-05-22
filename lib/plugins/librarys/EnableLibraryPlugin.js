const { kindOf } = require('../../utils/kindOf')

const WindowLibraryPlugin = require("./WindowLibraryPlugin");
const AmdLibraryPlugin = require("./AmdLibraryPlugin");
const CommonjsLibraryPlugin = require("./CommonjsLibraryPlugin");
const UmdLibraryPlugin = require("./UmdLibraryPlugin");
const ModuleLibraryPlugin = require("./ModuleLibraryPlugin");


class EnableLibraryPlugin {
    constructor(type) {
        this.type = type || "commonjs"
    }

    // 给生成的module代码包装为各种不同的模块
    // (兼容各种模块化规范)
    buildAsLibrary(compilation, callNext) {
        //todo 准备好outputCode的数据类型
        const type = compilation.config?.library.type
            || "commonjs"

        // 根据不同的类型 动态执行插件
        if (typeof type === 'string') {
            switch (type) {
                case "window": {
                    new WindowLibraryPlugin().render(compilation)
                    break
                }
                case "commonjs": {
                    new CommonjsLibraryPlugin().render(compilation)
                    break
                }
                case "amd": {
                    new AmdLibraryPlugin().render(compilation)
                    break
                }
                case "umd": {
                    new UmdLibraryPlugin().render(compilation)
                    break
                }
                case "module": {
                    new ModuleLibraryPlugin().render(compilation)
                    break
                }
                default:
                    throw new Error(`Unsupported library type ${type}.`)
            }

            callNext()

        } else {
            throw new Error(`config "type" must be a string , Get ${kindOf(this.type)}.`)
        }
    }

    // 注册
    run(compilation) {
        const handler = this.buildAsLibrary.bind(this)
        compilation.hooks.BundleSync.tapAsync("EnableLibraryPlugin", handler)
    }
}


module.exports = EnableLibraryPlugin