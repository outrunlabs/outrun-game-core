import { World } from "./World"
import { WorldState } from "./Store"

const getTotalElapsedTime = (world: World): number => {
    const worldState = world as WorldState
    return worldState.totalElapsedTime
}

export const Selectors = {
    getTotalElapsedTime,
}
