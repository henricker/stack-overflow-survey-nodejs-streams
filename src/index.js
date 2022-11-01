import { Controller } from './controller.js'
import { Service } from './service.js'
import { View } from './view.js'

const surveys = [2019, 2018, 2017, 2016]
const techs = ['react', 'vue', 'angular', 'ember']

const service = new Service({
    surveys,
    techs,
    defaultSurveysFolder: './docs/state-of-js'
})

const view = new View()

await Controller.initialize({
    view,
    service,
})