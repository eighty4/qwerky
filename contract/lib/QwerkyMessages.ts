export class Element {
    constructor(readonly tagName: string,
                readonly id: string,
                readonly classes: Array<string>,
                readonly text: string | null,
                readonly size: Size,
                readonly position: Point) {
    }
}

export class Rect {
    constructor(readonly x: number, readonly y: number, readonly h: number, readonly w: number) {
    }
}

export class Point {
    constructor(readonly x: number, readonly y: number) {
    }
}

export class Size {
    constructor(readonly height: number, readonly width: number) {
    }
}

export type ApiRequest = OpenPage | InspectPoint | InspectSelector

export type ApiResponse = PageOpenedData | InspectPointData | InspectSelectorData

export type ApiRequestMessageType = 'open' | 'inspect'

export type ApiResponseMessageType = 'image' | 'describe'

export type ApiMessageType = ApiRequestMessageType | ApiResponseMessageType

export type ApiMessageBase = {
    sessionId: string
    messageType: ApiMessageType
}

export class OpenPage implements ApiMessageBase {
    readonly messageType = 'open'

    constructor(readonly sessionId: string, readonly url: string) {
    }
}

export class InspectPoint implements ApiMessageBase {
    readonly messageType = 'inspect'

    constructor(readonly sessionId: string, readonly point: Point) {
    }
}

export class InspectSelector implements ApiMessageBase {
    readonly messageType = 'inspect'

    constructor(readonly sessionId: string, readonly selector: string) {
    }
}

export class PageOpenedData implements ApiMessageBase {
    readonly messageType = 'image'

    constructor(readonly sessionId: string, readonly image: string, readonly size: Size) {
    }
}

export class InspectPointData implements ApiMessageBase {
    readonly messageType = 'describe'

    constructor(readonly sessionId: string, readonly point: Point, readonly elements: Array<Element>) {
    }
}

export class InspectSelectorData implements ApiMessageBase {
    readonly messageType = 'describe'

    constructor(readonly sessionId: string, readonly selector: string, readonly elements: Array<Element>) {
    }
}
