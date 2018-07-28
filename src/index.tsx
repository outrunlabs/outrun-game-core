export * from "./Actions"
export * from "./Game"
export * from "./Platform"
export * from "./Types"

import { isBrowser } from "./Utility"

import { DimensionsProvider } from "./DimensionsProvider"

export const Dimensions = new DimensionsProvider()

if (isBrowser()) {
    const updateDimensions = () => {
        Dimensions.set("window", {
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }

    if (window) {
        updateDimensions()

        window.onresize = () => {
            updateDimensions()
        }
    }
}
