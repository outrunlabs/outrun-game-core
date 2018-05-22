import { IEvent, Event } from "oni-types"

export type DimensionInfo = {
    width: number
    height: number
}

export type DimensionProperties = { [key: string]: DimensionInfo }

export class DimensionsProvider {
    private _dimensions: DimensionProperties = {}
    private _dimensionChangedEvent: Event<DimensionProperties> = new Event<DimensionProperties>()

    public get onDimensionsChanged(): IEvent<DimensionProperties> {
        return this._dimensionChangedEvent
    }

    public get(dimensionType: string): DimensionInfo | null {
        return this._dimensions[dimensionType] || null
    }

    public set(dimensionType: string, dim: DimensionInfo): void {
        this._dimensions = {
            ...this._dimensions,
            [dimensionType]: dim,
        }

        this._dimensionChangedEvent.dispatch({ ...this._dimensions })
    }
}
