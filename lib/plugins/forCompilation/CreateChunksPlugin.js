const Chunk = require('../../core/Chunk')

//TODO 构建结束后生成chunk的插件
class CreateChunksPlugin {
    constructor() { }


    createChunks(compilation, callNext) {

        // 生成多个chunks
        const chunk = new Chunk({
            name: 'bundle.js',
            type: "js",
        })

        compilation.chunks.set('bundle.js', chunk)

        // 给chunk添加模块
        const modules = compilation.buildQueue

        for (let m of modules) {
            if (m.type == "javascript") {
                chunk.addModule(m)
            }
        }

        callNext()
    }

    run(compilation) {
        const handler = this.createChunks.bind(this)
        compilation.hooks.BundleSync.tapAsync("CreateChunksPlugin", handler)
    }
}

module.exports = CreateChunksPlugin



