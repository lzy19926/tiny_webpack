// 模块工厂,用来给Compilation创建单个模块资源
// 在创建Compilation时通过param注入
const NormalModule = require('./NormalModule')
const JavascriptGenerator = require('./JavaScriptGenerator')
const JavaScriptParser = require('./JavaScriptParser')

// todo
const AddFileSuffixPlugin = require('../plugins/forModuleFactory/AddFileSuffixPlugin')
const CheckFileSuffixPlugin = require('../plugins/forModuleFactory/CheckFileSuffixPlugin')
class ModuleFactory {
    constructor(resolverFactory, config) {

        this.config = config
        this.resolverFactory = resolverFactory
        this.setting = {}
        this.parserCache = new Map()
        this.generatorCache = new Map()
    }

    create(params) {

        const setting = {
            generator: {
                Type: "javascript",
                options: {}
            },
            parser: {
                Type: "javascript",
                options: {}
            },
            resolver: {
                Type: "async",
                options: {}
            },
        }

        const fileInfo = this.parseFile(params.absolutePath)

        const type = fileInfo.type      // 模块类型
        const filePath = fileInfo.path  // 模块路径   //todo LazySet改良
        const dependencies = []    // 依赖项
        const loaders = this.config.rules // loaders

        const generator = this.getGenerator(
            setting.generator.Type,
            setting.generator.options
        )
        const parser = this.getParser(
            setting.parser.Type,
            setting.parser.options
        )
        const resolver = this.getResolver(
            setting.resolver.Type,
            setting.resolver.options
        )

        const normalModule = new NormalModule(
            Object.assign({}, {
                type,
                filePath,
                dependencies,
                loaders,
                generator,
                parser,
                resolver
            }))


        // TODO 执行模块构建
        if (normalModule.type === "javascript") {
            normalModule.build()
        }

        return normalModule
    }

    parseFile(path) {
        const pathWithSuffix = parseFilePath(path)
        const type = parseFileType(pathWithSuffix)
        return {
            path: pathWithSuffix,
            type: type
        }
    }

    // 用于给module创建需要使用的各类组件
    // resolver的创建和缓存逻辑在resolverFactory中
    getParser(type, options = {}) {

        let cache = this.parserCache
        if (!cache) {
            this.parserCache = new Map()
        }

        let parser = cache.get(options);
        if (!parser) {
            parser = new JavaScriptParser(type, options)
            cache.set(options, parser)
        }

        return parser
    }
    getGenerator(type, options = {}) {

        let cache = this.generatorCache
        if (!cache) {
            this.generatorCache = new Map()
        }

        let generator = cache.get(options);
        if (!generator) {
            generator = new JavascriptGenerator(type, options)
            cache.set(options, generator)
        }

        return generator
    }
    getResolver(type) {
        return this.resolverFactory.get(type)
    }

}


// todo --------这两个逻辑块和读取文件内容,执行loader逻辑需要插件化----------

// 添加文件后缀
function parseFilePath(path) {

    const needHandle = !(path[0] !== '.' && path[1] !== ':')

    if (needHandle) {
        var index = path.lastIndexOf(".");
        var ext = path.substr(index + 1);

        if (ext.length > 5) {
            path = path + '.js'
        }
    }

    return path
}

//非js,cjs,mjs,jsx文件或者lzy不执行
function parseFileType(absolutePath) {

    const isJSFile = /\.js$/.test(absolutePath)
        || /\.ts$/.test(absolutePath)
        || /\.cjs$/.test(absolutePath)
        || /\.mjs$/.test(absolutePath)
        || /\.jsx$/.test(absolutePath)
        || /\.tsx$/.test(absolutePath)
    const isLzyFile = /\.lzy$/.test(absolutePath)

    const isCSSFile = /\.css$/.test(absolutePath)
        || /\.scss$/.test(absolutePath)
        || /\.less$/.test(absolutePath)


    if (isJSFile || isLzyFile) return "javascript"
    else if (isCSSFile) return "css"
    else return console.error("unknow file type")
}


module.exports = ModuleFactory