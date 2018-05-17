import { applyMiddleware, compose, createStore, Middleware, AnyAction, Store } from "redux"

import { GameActions, NullAction } from "./Actions"
import Reducer from "./Reducer"
import { ReducerFunction, IdToModel, Model } from "./Types"
import { World } from "./World"

export interface WorldState extends World {
    models: IdToModel
    totalElapsedTime: number
}

export const DefaultWorldState: WorldState = {
    models: {},
    totalElapsedTime: 0,
}

export const createWorldStore = () => {
    return createStore(Reducer, DefaultWorldState)
}
