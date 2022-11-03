import { Controller } from './controller.js'
import { Service } from './service.js'
import { View } from './view.js'
import config from './config.js'

const outputFinal = './docs/final.json'

const service = new Service({
    ...config,
    defaultSurveysFolder: './docs/state-of-js',
    outputFinal,

})

const view = new View()

await Controller.initialize({
    view,
    service,
})