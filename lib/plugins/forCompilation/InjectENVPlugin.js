

// 给输出的代码注入环境变量
class InjectENVPlugin {
    constructor() { }

    injectENV(compilation) {
        
        const mode = compilation.config.mode
        const isValidateMode = ['production', 'development', 'none'].some((i) => i == mode)
        if (!isValidateMode) { console.warn('请输入正确的mode配置,"production"|"development"|"none"') }

        const chunk = compilation.chunks.get("bundle.js")

        const envStr = `
//TODO 注入环境变量
const process = {env:{NODE_ENV:'${mode}'}};
                `

        chunk.code = envStr + chunk.code
    }

    run(compilation) {
        const handler = this.injectENV.bind(this)
        compilation.hooks.BundleSync.tapAsync("InjectENVPlugin", handler)
    }
}

module.exports = InjectENVPlugin



