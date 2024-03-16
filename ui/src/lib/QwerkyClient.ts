import {v4} from 'uuid'
import type {ApiRequest, ApiResponse, Element, Point, Rect, Size} from 'qwerky-contract'

export interface QwerkyMessageHandler {
    onBoundingBoxes(boundingBoxes: Array<Rect>): void

    onImageData(image: string, size: Size | null): void

    onDescribePoint(point: Point, element: Element): void

    onDescribeSelector(selector: string, element: Element): void

    onConnectionLost(): void
}

export class QwerkyClient {

    static connect(messageHandler: QwerkyMessageHandler): QwerkyClient {
        return new QwerkyClient(new WebSocket(`ws://${location.host}/api`), messageHandler)
    }

    private readonly sessionId = v4()

    constructor(private readonly webSocket: WebSocket,
                private readonly messageHandler: QwerkyMessageHandler) {
        this.webSocket.onopen = this.onopen
        this.webSocket.onclose = this.onclose
        this.webSocket.onmessage = this.onmessage
    }

    onopen = () => console.log('ws connected')

    onclose = ({code}: CloseEvent) => {
        console.log('ws closed', code)
        this.messageHandler.onConnectionLost()
    }

    onmessage = ({data}: MessageEvent) => this.handleMessage(JSON.parse(data))

    sendMessage(message: ApiRequest) {
        (message as any).sessionId = this.sessionId
        console.log('ws send', message.messageType)
        this.webSocket.send(JSON.stringify(message))
    }

    handleMessage(msg: ApiResponse) {
        console.log('ws recv', msg)
        switch (msg.messageType) {
            case 'image':
                this.messageHandler.onImageData(msg.image, msg.size)
                break
            case 'describe':
                break
            case 'boundingBoxes':
                this.messageHandler.onBoundingBoxes(msg.boundingBoxes)
                break
            default:
        }
    }
}
