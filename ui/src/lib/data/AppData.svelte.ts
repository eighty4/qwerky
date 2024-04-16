import type {Element, Point} from '@eighty4/qwerky-contract'
import {type BoundingBox, buildBoundingBoxes} from '$lib/data/BoundingBox'

export interface InspectResult {
    elements: Array<Element>
    point?: Point
    selector?: string
}

export enum InspectionStatus {
    requested,
    retrieved,
}

export enum InspectionType {
    point,
    selector
}

export interface InspectionState {
    boundingBoxes: Array<BoundingBox>
    result: InspectResult
    status: InspectionStatus
    type: InspectionType
}

export interface AppData {
    addInspectResult(result: InspectResult): void

    get focusedInspection(): InspectionState | null

    get url(): string | null

    set url(url: string | null)
}

export function createAppData(): AppData {
    let _currentIndex: number = $state(-1)
    let _inspections: Array<InspectionState> = $state([])
    let _url: string | null = $state(null)

    let _currentInspection: InspectionState | null = $derived.by(() => {
        if (_inspections[_currentIndex]) {
            return _inspections[_currentIndex]
        } else {
            return null
        }
    })

    $inspect(_currentIndex, _currentInspection)

    return {
        get focusedInspection(): InspectionState | null {
            return _currentInspection
        },
        get url(): string | null {
            return _url
        },
        set url(url: string | null) {
            _url = url
        },
        addInspectResult(result: InspectResult) {
            _inspections.push({
                boundingBoxes: buildBoundingBoxes(result.elements),
                type: result.selector ? InspectionType.selector : InspectionType.point,
                status: InspectionStatus.retrieved,
                result,
            })
            _currentIndex++
        },
    }
}
