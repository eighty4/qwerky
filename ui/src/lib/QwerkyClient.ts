import {v4} from 'uuid'
import type {
    ApiRequest,
    ApiResponse,
    BoundingBoxesData,
    Element,
    InspectPointData,
    InspectSelectorData,
    PageOpenedData,
    Point,
    Rect,
    Size,
} from 'qwerky-contract'

export interface QwerkyMessageHandler {
    onBoundingBoxes(boundingBoxes: Array<Rect>): void

    onImageData(image: string, size: Size | null): void

    onDescribePoint(point: Point, elements: Array<Element>): void

    onDescribeSelector(selector: string, elements: Array<Element>): void

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
            case 'boundingBoxes':
                msg = (msg as BoundingBoxesData)
                this.messageHandler.onBoundingBoxes(msg.boundingBoxes)
                break
            default:
        }
    }
}
