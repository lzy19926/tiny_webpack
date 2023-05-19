

class CreateManifestPlugin {
    constructor() { }

    createManifest(compilation) {

        //1 通过入口文件构建文件资源
        const entry = this.compilation.config.entry
        const mainModule = this.compilation.createModule(entry)

        //2 使用队列循环方式构建依赖图(BFS遍历 使用createModule处理每个js文件)
        const queue = [mainModule]

        for (const module of queue) {
            this.renderProgressBar(`构建依赖${module.filePath}`); //! ------------------------进度显示
            const dirname = path.dirname(module?.filePath) // 获取当前处理文件的绝对路径
            const deps = module.dependencies
            module.mapping = {} // 文件的依赖map

            for (let relativePath of deps) {// 遍历文件依赖的文件
                const absolutePath = this.compilation.resolveModulePath(relativePath, dirname) // 预处理路径

                module.mapping[relativePath] = absolutePath //通过相对路径和绝对路径匹配 构建资源依赖图

                const hasSameModule = queue.some((module) => {
                    return module.filePath === absolutePath
                })
                if (hasSameModule) continue //重复模块不执行

                const childModule = this.createModule(absolutePath) //通过绝对路径构建子文件资源
                if (childModule) {//处理好的js资源推入数组 (childModule会进入下个循环继续执行)
                    queue.push(childModule)
                }
            }
        }

        this.fileID = -1
        this.Manifast = queue
        return queue
    }

    run(compilation) {
        const handler = this.createManifest.bind(this, compilation)
        compilation.hooks.CompileSync.tap("CreateManifestPlugin", handler)
    }
}