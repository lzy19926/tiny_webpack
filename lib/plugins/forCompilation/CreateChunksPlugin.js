const Chunk = require('../../lzy_webpack/Chunk')

// 构建结束后生成chunk的插件
class CreateChunksPlugin {
    constructor() { }


    createChunks(compilation) {

        const chunk = new Chunk({
            name: 'bundle',
            type: "js",
            code: compilation.buildProcessCode
        })

        compilation.chunks.add(chunk)
    }

    run(compilation) {
        const handler = this.createChunks.bind(this)
        compilation.hooks.BundleSync.tapAsync("CreateChunksPlugin", handler)
    }
}

module.exports = CreateChunksPlugin



