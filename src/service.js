import { createReadStream, createWriteStream, statSync } from 'fs';
import { pipeline } from 'stream/promises'

export class Service {
    constructor({
        surveys,
        techs,
        defaultSurveysFolder
    }) {
        this.surveys = surveys || []
        this.techs = techs || []
        this.defaultSurveysFolder = defaultSurveysFolder
    }

    async * #mergeStreams(streams) {
        for(const stream of streams) {
            for await (const chunk of stream) {
                yield chunk
            }
        }
    }

    async #prepareStreams() {
        const readStreams = this.surveys.map(survey => {
            return createReadStream(`${this.defaultSurveysFolder}/${survey}.ndjson`)
        })

        const totalSizeFiles = this.surveys.map(survey => {
            return statSync(`${this.defaultSurveysFolder}/${survey}.ndjson`).size
        }).reduce((acc, curr) => acc + curr, 0)

        return {
            stream: this.#mergeStreams(readStreams),
            totalSizeFiles
        }
    }

    #handleProgressBar({ progressBarNotifier, totalSizeFiles }) {
        let processedFiles = 0

        async function * progressBarUpdateStream(stream) {
            for await (const chunk of stream) {
                processedFiles += chunk.length
                progressBarNotifier.emit('update', { processedFiles, totalSizeFiles })
                yield chunk
            }
        }

        return progressBarUpdateStream.bind(this)
    }

    async runPipeline({
        progressBarNotifier,
    }) {
        const { stream, totalSizeFiles } = await this.#prepareStreams();

        return pipeline(
            stream,
            this.#handleProgressBar({ progressBarNotifier, totalSizeFiles }),
            createWriteStream('./docs/merged.ndjson')
        )
    }
}