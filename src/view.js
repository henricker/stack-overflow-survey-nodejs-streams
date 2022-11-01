import blessed from "blessed";
import contrib from "blessed-contrib";

export class View {
    constructor() {
        this.lastProgressBarAnimate = 0;
        this.screen = null;
        this.progressBar = null;
    }

    initialize() {
        this.#buildInterface();
        this.#buildProgressBar();
    }

    #buildInterface() {
        const screen = this.screen = blessed.screen();
        screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
        screen.render();

        return screen;
    }

    #buildProgressBar() {
        this.progressBar = contrib.donut({
            left: 'center',
            top: 'center',
            height: '50%',
            width: '50%',
            radius: 8,
            arcWidth: 3,
            remainColor: 'black',
            yPadding: 2,
        })

        this.screen.append(this.progressBar);
        this.screen.render();
    }

    onProgressBarUpdate({ processedFiles, totalSizeFiles }) {
        const justProcessed = Math.ceil((processedFiles / totalSizeFiles) * 100)

        if(this.lastProgressBarAnimate === justProcessed) return;

        this.lastProgressBarAnimate = justProcessed;

        this.progressBar.setData([
            { percent: justProcessed, label: 'processing...', 'color': 'green' },
        ]);

        this.screen.render();
    }
}