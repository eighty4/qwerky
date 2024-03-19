import type {Element, Point} from 'qwerky-contract'

export default interface InspectResult {
    elements: Array<Element>
    point?: Point
    selector?: string
}
