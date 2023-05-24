#!/usr/bin/env node
const DevServer = require('../lib/devServer/DevServer')
const createCompiler = require('../lib/core/webpack')


const webpackCompiler = createCompiler()
const devServe = new DevServer(webpackCompiler)


devServe.run()