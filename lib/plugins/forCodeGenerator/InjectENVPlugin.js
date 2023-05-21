

// 给输出的代码注入环境变量
class InjectENVPlugin {
    constructor() { }

    injectENV(compilation, callNext) {
        const mode = compilation.config.mode
        const isValidateMode = ['production', 'development', 'none'].some((i) => i == mode)
        if (!isValidateMode) { console.warn('请输入正确的mode配置,"production"|"development"|"none"') }

        const envStr = `
//TODO 注入环境变量
const process = {env:{NODE_ENV:'${mode}'}};
                `

        compilation.buildProcessCode = envStr + compilation.buildProcessCode

        callNext()
    }

    run(generator) {
        const handler = this.injectENV.bind(this)
        generator.hooks.generatePack.tapAsync("InjectENVPlugin", handler)
    }
}

module.exports = InjectENVPlugin



