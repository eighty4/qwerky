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

export class AppData {
    #currentIndex: number = $state(0)
    #inspections: Array<InspectionState> = $state([])
    #url: string | null = $state(null)

    #currentInspection: InspectionState | null = $derived.by(() => {
        if (this.#inspections[this.#currentIndex]) {
            return this.#inspections[this.#currentIndex]
        } else {
            return null
        }
    })

    get focusedInspection(): InspectionState | null {
        return this.#currentInspection
    }

    get inspections(): Array<InspectionState> {
        return this.#inspections
    }

    set url(url: string) {
        this.#url = url
    }

    get url(): string | null {
        return this.#url
    }

    addInspectResult(result: InspectResult): void {
        this.#inspections.push({
            boundingBoxes: buildBoundingBoxes(result.elements),
            result,
            status: InspectionStatus.retrieved,
            type: result.selector ? InspectionType.selector : InspectionType.point,
        })
        this.#currentIndex = this.#inspections.length - 1
    }
}
