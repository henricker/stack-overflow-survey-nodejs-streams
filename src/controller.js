import Event from 'events';

export class Controller {
    constructor({
        view,
        service,
    }) {
        this.view = view
        this.service = service
    }

    static async initialize(...args) {
        const controller = new Controller(...args)
        return controller.__init()
    }

    handleProgressBarUpdate(...args) {
        this.view.onProgressBarUpdate(...args)
    }

    handleGraphUpdate(item) {
        this.view.buildLineChart();
        const lineChartData = this.service.onLineChartUpdate(item);
        this.view.updateLineChart(lineChartData)
    }

   async __init() {
        const progressBarNotifier = new Event() 
        const graphNotifier = new Event()       
        progressBarNotifier.on('update', this.handleProgressBarUpdate.bind(this))
        graphNotifier.on('update', this.handleGraphUpdate.bind(this))
        
        this.view.initialize()

        try {
            await this.service.runPipeline({ progressBarNotifier, graphNotifier })
        } catch(err) {
            console.error('Error', err)
        }
    }
}