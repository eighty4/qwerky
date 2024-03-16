import {EventEmitter} from 'node:events'
import WebSocket from 'ws'
import {type ApiRequest, type ApiResponse, BoundingBoxesData, InspectPoint, InspectSelector} from 'qwerky-contract'
import type {QwerkyPage, QwerkyPageProvider} from './QwerkyPage.js'

enum QwerkyConnectionState {
    ACTIVE = 'active',
    CLOSING = 'closing',
    CLOSED = 'closed',
}

export declare interface QwerkyConnection {
    on(event: 'close', listener: () => void): this
}

// todo session timeout
export class QwerkyConnection extends EventEmitter {
    private page?: QwerkyPage
    private state: QwerkyConnectionState = QwerkyConnectionState.ACTIVE

    constructor(private readonly pageProvider: QwerkyPageProvider, private readonly ws: WebSocket) {
        super()
        ws.on('message', this.onWsMessage)
        ws.on('close', this.onWebSocketClose)
    }

    isActive(): boolean {
        return this.state === QwerkyConnectionState.ACTIVE
    }

    private onWsMessage = (json: string) => {
        if (!this.isActive()) {
            return
        }
        const msg = JSON.parse(json)
        console.log('ws recv', msg)
        this.handleWsMessage(msg)
            .then(this.handleWsMessageResult)
            .catch(e => console.log('error handling msg', e.message, msg))
    }

    private async handleWsMessage(msg: ApiRequest): Promise<ApiResponse> {
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

    private handleWsMessageResult = (result: ApiResponse) => {
        if (this.isActive() && result) {
            console.log('ws send', result.messageType)
            if (result.messageType === 'image') {
                // todo image data should be sent as a binary buffer and not a base64 str
                console.log('ws send', {
                    messageType: result.messageType,
                    size: result.size,
                    sessionId: result.sessionId,
                    image: 'ZGVzcGVyYWRvcw==',
                })
            } else {
                console.log('ws send', result)
            }
            this.ws.send(JSON.stringify(result))
        }
    }

    private async openPage(sessionId: string, url: string) {
        if (!this.page) {
            this.page = await this.pageProvider(sessionId)
            this.page.on('close', this.onBrowserPageClose)
        }
        const reply = await this.page!.open(url)
        if (process.env.QWERKY_POC_SCRAPE_BOUNDING_BOX === 'true') {
            this.page.scrapeBoundingBoxes().then(boundingBoxes => {
                this.ws.send(JSON.stringify(new BoundingBoxesData(sessionId, boundingBoxes)))
            })
        }
        return reply
    }

    private onBrowserPageClose = () => {
        console.debug('QwerkyConnection.onBrowserPageClose')
        this.state = QwerkyConnectionState.CLOSING
        this.ws.off('close', this.onWebSocketClose)
        this.closeWebSocket()
        this.state = QwerkyConnectionState.CLOSED
        this.emit('close')
    }

    private onWebSocketClose = (code: number) => {
        console.debug('QwerkyConnection.onWebSocketClose', code)
        this.state = QwerkyConnectionState.CLOSING
        this.page?.off('close', this.onBrowserPageClose)
        this.closeBrowserPage().then().catch().finally(() => {
            this.state = QwerkyConnectionState.CLOSED
            this.emit('close')
        })
    }

    private async closeBrowserPage(): Promise<void> {
        console.debug('QwerkyConnection.closeBrowserPage')
        if (this.page) {
            try {
                await this.page.close()
            } catch (e) {
                console.error('QwerkyConnection.closeBrowserPage page:', e)
            }
        }
    }

    private closeWebSocket() {
        console.debug('QwerkyConnection.closeWebSocket')
        if (this.ws.readyState < WebSocket.CLOSING) {
            this.ws.close()
        }
    }
}
