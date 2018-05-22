import * as React from "react"

import { IEvent } from "oni-types"
import { DimensionsProvider } from "./../src/DimensionsProvider"

describe("DimensionsProvider", () => {
    let dimensionsProvider: DimensionsProvider | null = null
    beforeEach(() => {
        dimensionsProvider = new DimensionsProvider()
    })

    it("sets and gets", () => {
        dimensionsProvider.set("test", { width: 1, height: 1 })
        const result = dimensionsProvider.get("test")

        expect(result).toEqual({ width: 1, height: 1 })
    })

    it("dispatches event when changed", () => {
        dimensionsProvider.set("test", { width: 1, height: 1 })

        let result = null

        dimensionsProvider.onDimensionsChanged.subscribe(item => {
            result = item
        })

        dimensionsProvider.set("test", { width: 2, height: 2 })

        expect(result).toEqual({
            test: {
                width: 2,
                height: 2,
            },
        })
    })
})
