export * from "./Actions"
export * from "./Game"
export * from "./Platform"
export * from "./Selectors"
export * from "./Types"
export * from "./World"

import { DimensionsProvider } from "./DimensionsProvider"

export const Dimensions = new DimensionsProvider()

const updateDimensions = () => {
    Dimensions.set("window", {
        width: window.innerWidth,
        height: window.innerHeight,
    })
}

updateDimensions()

window.onresize = () => {
    updateDimensions()
}
