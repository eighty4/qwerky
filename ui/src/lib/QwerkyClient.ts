import {v4} from 'uuid'
import type {ApiRequest, ApiResponse, Size, Point} from 'qwerky-contract'

export interface QwerkyMessageHandler {
    onImageData(image: string, size: Size | null): void
    onDescribePoint(point: Point, element: Element): void
    onDescribeSelector(selector: string, element: Element): void
}

export class QwerkyClient {

    static localApi(messageHandler: QwerkyMessageHandler): QwerkyClient {
        return new QwerkyClient(new WebSocket('ws://localhost:5394/api'), messageHandler)
    }

    private readonly sessionId = v4()

    constructor(private readonly webSocket: WebSocket,
                private readonly messageHandler: QwerkyMessageHandler) {
        this.webSocket.onopen = this.onopen
        this.webSocket.onclose = this.onclose
        this.webSocket.onmessage = this.onmessage
    }

    onopen = () => console.log('ws connected')

    onclose = ({code}: CloseEvent) => console.log('ws closed', code)

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
            default:
        }
    }
}
