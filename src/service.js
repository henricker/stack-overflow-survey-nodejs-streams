import { createReadStream, createWriteStream, statSync } from 'fs';
import { pipeline } from 'stream/promises'
import split from 'split2';

export class Service {
    constructor({
        surveys,
        techs,
        defaultSurveysFolder,
        likes,
        outputFinal,
        lineChartData
    }) {
        this.surveys = surveys || []
        this.techs = techs || []
        this.defaultSurveysFolder = defaultSurveysFolder
        this.likes = likes
        this.lineChartData = lineChartData
        this.outputFinal = outputFinal
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

    #handleMergeLists({
        list,
        mapper
    }) {
        return list.map(mapper).reduce(
            (prev, next) => ({ ...prev, ...next }), {}
        )
    }

    async * #handleMappingLikes(stream) {
        for await(const data of stream) {
            const tools = data.tools;
            
            const mappedTools = this.#handleMergeLists({
                list: this.techs,
                mapper: (tech) => {
                    return {
                        [tech]: this.likes?.includes(tools?.[tech]?.experience)
                    }
                }
            })

            
            const finalItem = {
                ...mappedTools,
                year: data.year
            }

            yield finalItem
        }
    }

    #aggregateByYear(years) {
        const initialValues = this.#handleMergeLists({
            list: this.techs,
            mapper: item => ({ [item]: 0 })
        })

        const mapItemsByYear = year => ({
            [year]: {
                ...initialValues,

                get total() {
                    return Reflect.ownKeys(this)
                        .filter(key => key !== 'total')
                        .map(key => this[key])
                        .reduce((acc, curr) => acc + curr, 0)
                }
            }
        })

        return this.#handleMergeLists({
            list: years,
            mapper: mapItemsByYear
        })
    }

    #aggregate({
        graphNotifier
    }) {
        async function * feedGraph(stream) {
            const yearsInContext = this.#aggregateByYear(this.surveys)

            for await (const data of stream) {
                const year = data.year.toString();
                Reflect.deleteProperty(data, 'year')
                Reflect.ownKeys(data)
                    .forEach(key => (
                        yearsInContext[year][key] += data[key]
                    ))
            }

            
            graphNotifier.emit('update', yearsInContext)
            yield JSON.stringify(yearsInContext)
        }

        return feedGraph.bind(this)
    }

    async * consoleStream(stream) {
        for await (const data of stream) {
            console.log(data)
        }
    }

    onLineChartUpdate(item) {
        // console.log(item)
        Reflect.ownKeys(item)
            .map(year => {
                const indexYear = this.surveys.indexOf(year.toString());

                const {total, ...yearContext} = item[year];

                Reflect.ownKeys(yearContext)
                    .map(lib => {
                        this.lineChartData[lib].y[indexYear] = yearContext[lib]
                    })
            })

        return Object.values(this.lineChartData)
    }

    async runPipeline({
        progressBarNotifier,
        graphNotifier
    }) {
        const { stream, totalSizeFiles } = await this.#prepareStreams();

        return pipeline(
            stream,
            this.#handleProgressBar({ progressBarNotifier, totalSizeFiles }),
            split(JSON.parse),
            this.#handleMappingLikes.bind(this),
            this.#aggregate({ graphNotifier }),
            createWriteStream(this.outputFinal)
        )
    }
}