import * as React from "react"

import { IEvent } from "oni-types"
import { Game } from "./../src/Game"

it("emits actions", () => {
    const game = new Game()

    let hitCount = 0
    game.onAction.subscribe(action => {
        expect(action.type).toEqual("TEST")
        hitCount++
    })

    game.dispatch({ type: "TEST" })

    expect(hitCount).toBe(1)
})

interface TestState {
    count: number
}

const DefaultState: TestState = {
    count: 0,
}

type Actions =
    | {
          type: "Increment"
      }
    | {
          type: "Decrement"
      }

const TestReducer = (state: TestState, actions: Actions) => {
    switch (actions.type) {
        case "Increment":
            return {
                count: state.count + 1,
            }
        case "Decrement":
            return {
                count: state.count - 1,
            }
        default:
            return state
    }
}

describe("createModel", () => {
    it("creates a model", () => {
        const game = new Game()
        const model = game.createModel<TestState, Actions>("test", DefaultState, TestReducer)
        expect(model).not.toBe(null)
    })

    it("model selector returns initial state", () => {
        const game = new Game()
        const model = game.createModel<TestState, Actions>("test", DefaultState, TestReducer)

        const world = game.getWorld()
        const state = model.selector(world)

        expect(state).toEqual(DefaultState)
    })

    it("selector returns new change after state change", () => {
        const game = new Game()
        const model = game.createModel<TestState, Actions>("test", DefaultState, TestReducer)

        const world = game.getWorld()

        game.dispatch({ type: "Increment" })

        const world2 = game.getWorld()
        const newState = model.selector(world2)

        expect(newState).not.toEqual(DefaultState)
        expect(newState.count).toEqual(1)
    })
})
