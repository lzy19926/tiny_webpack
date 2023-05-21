const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default


// 使用AST解析JS代码   生成依赖项文件列表
class ResolveDependenciesPlugin {
    constructor() { }


    //! 使用babel/parser将index代码转换为AST语法树
    parseAST(normalModule) {
        const fileContent = normalModule.sourceCode || ""

        const ast = parser.parse(fileContent, {
            sourceType: 'module'
        })

        normalModule._ast = ast

        return ast
    }

    // 从ast中解析出对应的依赖项
    parseDependencies(normalModule, ast) {

        const dependencies = normalModule?.dependencies || []

        if (!dependencies) {
            return ""
        }
        //! 使用babel/traverse遍历AST语法树  将所有import的文件推入dependencise数组
        // 传入的配置对象为visitor,配置钩子函数 不同的钩子会返回不同的语句(import expresstion等)
        // 遍历到对应的语句  就会执行钩子函数  返回语句的信息 (详见AST Exporer)   
        traverse(ast, {
            ImportDeclaration: (path, state) => {//todo 遇到import语句  将文件路径push到依赖数组(预处理path)
                const depRaletivePath = path.node.source.value

                dependencies.push(depRaletivePath)
                if (/\.css$/.test(depRaletivePath)) {
                    path.remove()
                }
            },
            CallExpression: (path, state) => {//todo 遇到require语句  将文件路径push到依赖数组(预处理path)
                const idName = path.node.callee?.name
                if (idName === 'require') {
                    let depRaletivePath = path.node.arguments[0].value

                    dependencies.push(depRaletivePath)
                    if (/\.css$ /.test(depRaletivePath)) {
                        path.remove()
                    }
                }
            }
        })

        normalModule.dependencies = dependencies

        return dependencies
    }

    // 
    resolveDependencies(normalModule, dependencies) {

    }

    // 综合方法
    parse(normalModule, callNext) {

        const ast = this.parseAST(normalModule)
        const dependencies = this.parseDependencies(normalModule, ast)
        const depMapping = this.resolveDependencies(normalModule, dependencies)

        callNext()
    }


    //todo 将useCustomLoader方法注册到moduleFactory的create钩子队列  创建module时执行 
    run(parser) {
        const handler = this.parse.bind(this)
        parser.hooks.parseAST.tapAsync("ResolveDependenciesPlugin", handler)
    }
}

module.exports = ResolveDependenciesPlugin



