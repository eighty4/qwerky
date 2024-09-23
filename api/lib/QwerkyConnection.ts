import {EventEmitter} from 'node:events'
import WebSocket from 'ws'
import {
    ApiMessageError,
    type ApiRequest,
    type ApiResponse,
    InspectPoint,
    InspectSelector,
} from '@eighty4/qwerky-contract'
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
        const apiRequest: ApiRequest = JSON.parse(json)
        console.log('ws recv', apiRequest)
        this.handleWsMessage(apiRequest)
            .then(this.handleWsMessageResult)
            .catch((e) => {
                console.log(e)
                console.log(Object.keys(e))
                console.log('error handling msg', e.message, apiRequest)
                if (process.env.NODE_ENV !== 'production') {
                    this.handleWsMessageResult(new ApiMessageError(apiRequest.sessionId, e.message))
                }
            })
    }

    private async handleWsMessage(apiRequest: ApiRequest): Promise<ApiResponse> {
        switch (apiRequest.messageType) {
            case 'open':
                return this.openPage(apiRequest.sessionId, apiRequest.url)
            case 'inspect':
                if (this.page) {
                    if (apiRequest['point']) return this.page.inspectPoint((apiRequest as InspectPoint).point)
                    if (apiRequest['selector']) return this.page.inspectSelector((apiRequest as InspectSelector).selector)
                }
                throw new Error('bad inspect msg')
            default:
                throw new Error(`bad msg type ${apiRequest['type']}`)
        }
    }

    private handleWsMessageResult = (apiResponse: ApiResponse) => {
        if (this.isActive() && apiResponse) {
            if (apiResponse.messageType === 'image') {
                // todo image data should be sent as a binary buffer and not a base64 str
                console.log('ws send', {
                    messageType: apiResponse.messageType,
                    size: apiResponse.size,
                    sessionId: apiResponse.sessionId,
                    image: 'ZGVzcGVyYWRvcw==',
                })
            } else {
                console.log('ws send', apiResponse)
            }
            this.ws.send(JSON.stringify(apiResponse))
        }
    }

    private async openPage(sessionId: string, url: string) {
        if (!this.page) {
            this.page = await this.pageProvider(sessionId)
            this.page.on('close', this.onBrowserPageClose)
        }
        return this.page!.open(url)
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
