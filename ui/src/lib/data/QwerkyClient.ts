import {v4} from 'uuid'
import {
    type ApiRequest,
    type ApiResponse,
    type Element,
    type InspectPointData,
    type InspectSelectorData,
    type PageOpenedData,
    type Point,
    type Size,
} from 'qwerky-contract'

export interface QwerkyMessageHandler {
    onImageData(image: string, size: Size | null): void

    onDescribePoint(point: Point, elements: Array<Element>): void

    onDescribeSelector(selector: string, elements: Array<Element>): void

    onConnectionLost(): void
}

export class QwerkyClient {

    static async connect(messageHandler: QwerkyMessageHandler): Promise<QwerkyClient> {
        const client = new QwerkyClient(new WebSocket(`ws://${location.host}/api`), messageHandler)
        return new Promise((res) => client.webSocket.onopen = () => res(client))
    }

    readonly sessionId: string = v4()

    constructor(private readonly webSocket: WebSocket,
                private readonly messageHandler: QwerkyMessageHandler) {
        this.webSocket.onclose = this.onclose
        this.webSocket.onerror = this.onerror
        this.webSocket.onmessage = this.onmessage
    }

    sendMessage(message: ApiRequest) {
        (message as any).sessionId = this.sessionId
        console.log('ws send', message.messageType)
        this.webSocket.send(JSON.stringify(message))
    }

    private onclose = ({code}: CloseEvent) => {
        console.log('ws closed', code)
        this.messageHandler.onConnectionLost()
    }

    private onerror = (e: Event) => {
        console.log('ws error', e.type)
    }

    private onmessage = ({data}: MessageEvent) => this.handleMessage(JSON.parse(data))

    private handleMessage(msg: ApiResponse) {
        console.log('ws recv', msg)
        switch (msg.messageType) {
            case 'image':
                msg = (msg as PageOpenedData)
                this.messageHandler.onImageData(msg.image, msg.size)
                break
            case 'describe':
                if ((msg as any)['point']) {
                    msg = (msg as InspectPointData)
                    this.messageHandler.onDescribePoint(msg.point, msg.elements)
                } else if ((msg as any)['selector']) {
                    msg = (msg as InspectSelectorData)
                    this.messageHandler.onDescribeSelector(msg.selector, msg.elements)
                } else {
                    throw new Error(`invalid describe message {${Object.keys(msg)}`)
                }
                break
            default:
        }
    }
}
