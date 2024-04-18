import type {Element, Point} from '@eighty4/qwerky-contract'

export interface InspectResult {
    elements: Array<Element>
    point?: Point
    selector?: string
}
