import * as React from "react"

import { IEvent } from "oni-types"
import { Game } from "./../src/Game"

import { Effect } from "./../src/Types"

export interface SimpleWorld {
    value: number
}

export const simpleReducer = (world: SimpleWorld, action: any) => {
    switch (action.type) {
        case "TEST": {
            return { value: world.value + 1 }
        }
        default:
            return world
    }
}

export const reducerWithEffect = (callback: Function) => (
    world: SimpleWorld,
    action: any,
): SimpleWorld | [SimpleWorld, Effect] => {
    switch (action.type) {
        case "TEST": {
            return [world, () => callback()]
        }
        default:
            return [world, null]
    }
}

it("emits actions", () => {
    const game = Game.create(
        {
            value: 1,
        },
        simpleReducer,
    )

    let hitCount = 0
    game.onAction.subscribe(action => {
        expect(action.type).toEqual("TEST")
        hitCount++
    })

    game.dispatch({ type: "TEST" })

    expect(hitCount).toBe(1)
})

it("executes effects", () => {
    let hitCount = 0

    const effect = () => hitCount++

    const game = Game.create(
        {
            value: 1,
        },
        reducerWithEffect(effect),
    )

    game.dispatch({ type: "TEST" })

    const newState = game.getWorld()

    expect(hitCount).toBe(1)
})
