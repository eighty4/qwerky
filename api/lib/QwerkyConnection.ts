import {EventEmitter} from 'node:events'
import type WebSocket from 'ws'
import type {QwerkyPage, QwerkyPageProvider} from './QwerkyPage.js'
import {type ApiRequest, type ApiResponse, BoundingBoxesData, InspectPoint, InspectSelector} from 'qwerky-contract'

export declare interface QwerkyConnection {
    on(event: 'close', listener: () => void): this
}

export class QwerkyConnection extends EventEmitter {
    private active: boolean = true
    private page?: QwerkyPage

    constructor(private readonly pageProvider: QwerkyPageProvider, private readonly ws: WebSocket) {
        super()
        ws.on('message', this.onWsMessage)
        ws.on('close', this.onWsClose)
    }

    async close() {
        this.active = false
        if (this.page) {
            try {
                await this.page.close()
            } catch (e) {
                console.log('error closing playwright page:', e)
            }
        }
    }

    private onWsClose = (code: number) => {
        console.log('ws close', code)
        this.close().then().catch().finally(() => this.emit('close'))
    }

    private onWsMessage = (json: string) => {
        const msg = JSON.parse(json)
        console.log('ws recv', msg)
        this.handleWsMessage(msg)
            .then((result) => {
                if (this.active && result) {
                    console.log('ws send', result.messageType)
                    this.ws.send(JSON.stringify(result))
                }
            })
            .catch(e => console.log('error handling msg', e.message, msg))
    }

    private async handleWsMessage(msg: ApiRequest): Promise<ApiResponse | void> {
        switch (msg.messageType) {
            case 'open':
                return this.openPage(msg.sessionId, msg.url)
            case 'inspect':
                if (this.page) {
                    if (msg['point']) return this.page.inspectPoint((msg as InspectPoint).point)
                    if (msg['selector']) return this.page.inspectSelector((msg as InspectSelector).selector)
                }
                throw new Error('bad inspect msg')
            default:
                throw new Error(`bad msg type ${msg['type']}`)
        }
    }

    private async openPage(sessionId: string, url: string) {
        if (!this.page) {
            this.page = await this.pageProvider(sessionId)
        }
        const reply = await this.page!.open(url)
        if (process.env.QWERKY_POC_SCRAPE_BOUNDING_BOX === 'true') {
            this.page.scrapeBoundingBoxes().then(boundingBoxes => {
                this.ws.send(JSON.stringify(new BoundingBoxesData(sessionId, boundingBoxes)))
            })
        }
        return reply
    }
}
