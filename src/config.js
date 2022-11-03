const defaultY = () => [0, 0, 0, 0]
const surveys = ['2016', '2017', '2018', '2019']

const lineChartData = {
    angular: {
        title: 'angular',
        x: surveys,
        y: defaultY(),
        style: {
            // vermelho angular
            line: [170, 42, 44]
        }
    },
    react: {
        title: 'react',
        x: surveys,
        y: defaultY(),
        // azul react
        style: { line: [97, 218, 251] }
    },
    vuejs: {
        title: 'vuejs',
        x: surveys,
        y: defaultY(),
        // verde vue
        style: { line: [63, 178, 127] }
    },
    ember: {
        title: 'ember',
        x: surveys,
        y: defaultY(),
        // laranja vue
        style: { line: [218, 89, 46] }
    },
    backbone: {
        title: 'backbone',
        x: surveys,
        y: defaultY(),
        // verde backbone
        style: { line: [37, 108, 74] }
    }
}

export default {
    lineChartData,
    surveys,
    techs: Reflect.ownKeys(lineChartData),
    likes: ['interested', 'would_use']
}