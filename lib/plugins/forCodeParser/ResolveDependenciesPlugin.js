const parser = require('@babel/parser')
const types = require('@babel/types') // 用于创建AST节点
const traverse = require('@babel/traverse').default
const { importStatic } = require('../../lzy_webpack/importStatic')


// 使用AST解析JS代码   生成依赖项文件列表
class ResolveDependenciesPlugin {
    constructor() { }

    // 生成es5 代码和依赖数组(需要插件化)
    resolveDependencies(normalModule, callNext) {

        const dependencies = normalModule?.dependencies || []
        const fileContent = normalModule.sourceCode

        if (!dependencies || !fileContent) {
            return ""
        }

        //! 使用babel/parser将index代码转换为AST语法树  (不支持模块化语法 需要进行配置)
        const ast = parser.parse(fileContent, {
            sourceType: 'module'
        })

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
            },
            VariableDeclarator: (path, state) => {//todo 遇到importStatic语句  (处理path,替换AST)
                const isImportStatic =
                    path.node.init?.type === 'CallExpression' &&
                    path.node.init?.callee?.name === 'importStatic'

                if (isImportStatic) {
                    const key = path.node.id.name
                    const value = path.node.init.arguments[0].value
                    const nextValue = importStatic(value) // 删除多余public
                    const varName = types.identifier(key) // 变量名
                    const init = types.stringLiteral(nextValue);// 变量值 类型为string
                    const varDec = types.variableDeclarator(varName, init) // 创建变量key = value
                    const defaultVar = types.variableDeclaration('var', [varDec]) // 写入变量声明 var 
                    ast.program.body.unshift(defaultVar) //添加到文件Ast中
                    path.remove()//删除原句
                }
            },
        })

        normalModule._ast = ast
        normalModule.dependencies = dependencies

        // 继续下个插件
        callNext()
    }


    //todo 将useCustomLoader方法注册到moduleFactory的create钩子队列  创建module时执行 
    run(parser) {
        const handler = this.resolveDependencies.bind(this)
        parser.hooks.parseAST.tapAsync("ResolveDependenciesPlugin", handler)
    }
}

module.exports = ResolveDependenciesPlugin


