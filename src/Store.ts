import { applyMiddleware, compose, createStore, Middleware } from "redux";

import { World } from "./World"

import { GameActions, NullAction } from "./Actions";
import { ReducerFunction } from "./index"

export interface Model {
    friendlyName: string
    reducer: ReducerFunction<any, any>
    state: any
}

export type IdToModel = { [id: string]: Model }

export interface WorldState extends World {
    models: IdToModel

    width: number
    height: number

    totalElapsedTime: number
}

export type Entity = any

export type Radians = number

export const DefaultWorldState: WorldState = {
    models: {},
    nextEnemyId: 0,
    width: -1,
    height: -1,

    totalElapsedTime: 0,
}

const reducer = (state: WorldState = DefaultWorldState, action: GameActions): WorldState => {

    if (action.type === "@@core/NULL") {
        return state
    }

    const newState = {
        ...state,
        models: modelsReducer(state.models, action, state),
    }

    switch (action.type) {
        case "TICK":
            {
                return {
                    ...newState,
                    totalElapsedTime: state.totalElapsedTime + action.deltaTime,
                }
            }
        default:
            return newState
    }
}

const modelsReducer = (models: IdToModel, action: GameActions, world: World): IdToModel => {
    switch (action.type) {
        case "@@core/CREATE_MODEL":
            return {
                ...models,
                [action.id]: {
                    friendlyName: action.friendlyName,
                    state: action.state,
                    reducer: action.reducer,
                }
            }

        default: 
            const newModels = {
                ...models,
            }

            Object.keys(models).forEach((key) => {
                const model = models[key]
                newModels[key] = modelReducer(model, action, world)
            })

            return newModels
        }
}

const modelReducer = (model: Model, action: any, world: World): Model => {
    const newState = model.reducer(model.state, action, world)

    if (newState === model.state) {
        return model
    } else {
        return {
            ...model,
            state: newState,
        }
    }
    
}

export const createWorldStore = () => {
    return createStore<World>(reducer, DefaultWorldState)
}

