const { kindOf } = require('../../utils/kindOf')

const WindowLibraryPlugin = require("./WindowLibraryPlugin");
const AmdLibraryPlugin = require("./AmdLibraryPlugin");
const CommonjsLibraryPlugin = require("./CommonjsLibraryPlugin");
const UmdLibraryPlugin = require("./UmdLibraryPlugin");
const ModuleLibraryPlugin = require("./ModuleLibraryPlugin");


class EnableLibraryPlugin {
    constructor(type) {
        this.type = type || "commonjs" // 从config中进行注入
    }

    // 给生成的module代码包装为各种不同的模块
    buildAsLibrary(compilation, callNext) {
        // 准备好outputCode的数据类型
        const type = this.type
        // 根据不同的类型 动态执行插件
        if (typeof type === 'string') {
            switch (type) {
                case "window": {
                    new WindowLibraryPlugin().render(compilation)
                    callNext()
                }
                case "commonjs": {
                    new CommonjsLibraryPlugin().render(compilation)
                    callNext()
                }
                case "amd": {
                    new AmdLibraryPlugin().render(compilation)
                    callNext()
                }
                case "umd": {
                    new UmdLibraryPlugin().render(compilation)
                    callNext()
                }
                case "module": {
                    new ModuleLibraryPlugin().render(compilation)
                    callNext()
                }
                default:
                    new Error(`Unsupported library type ${type}.`)
            }

        } else {
            throw new Error(`config "type" must be a string , Get ${kindOf(this.type)}.`)
        }
    }

    // 注册
    run(generator) {
        const handler = this.buildAsLibrary.bind(this)
        generator.hooks.generatePack.tapAsync("EnableLibraryPlugin", handler)
    }
}


module.exports = EnableLibraryPlugin