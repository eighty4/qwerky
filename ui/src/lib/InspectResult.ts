import type {Element, Point} from 'qwerky-contract'

export interface InspectResult {
    elements: Array<Element>
    point?: Point
    selector?: string
}
