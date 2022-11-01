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

   async __init() {
        const progressBarNotifier = new Event()        
        progressBarNotifier.on('update', this.handleProgressBarUpdate.bind(this))

        
        this.view.initialize()

        try {
            await this.service.runPipeline({ progressBarNotifier })
        } catch(err) {
            console.error('Error', err)
        }
    }
}