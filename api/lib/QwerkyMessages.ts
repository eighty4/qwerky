export type ApiRequest = OpenPage | InspectPoint | InspectSelector

export type ApiResponse = PageOpenedData | InspectPointData | InspectSelectorData

export type OpenPage = {
    type: 'open'
    id: string
    url: string
}

export type Point = { x: number, y: number }

export type InspectPoint = {
    type: 'inspect'
    id: string
    point: Point
}

export type InspectSelector = {
    type: 'inspect'
    id: string
    selector: string
}

export type PageOpenedData = {
    id: string
    image: string
    size: { height: number, width: number } | null
    type: 'image'
}

export type Element = {
    id: string
    classes: Array<string>
    text: string | null
    size: any
    position: any
}

export type InspectPointData ={
    id: string
    point: Point
    element: Element
    type: 'describe'
}

export type InspectSelectorData = {
    id: string
    selector: string
    element: Element
    type: 'describe'
}
