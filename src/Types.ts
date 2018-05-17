import { applyMiddleware, compose, createStore, Middleware } from "redux"

import { World } from "./World"

export type RenderFunction = (world: World) => JSX.Element

export interface GameModelStateChangedEventArgs<TState> {
    oldState: TState
    newState: TState
}

export type SelectorFunction<TState> = (world: World) => TState

export interface GameModel<TState, TActions> {
    selector: SelectorFunction<TState>
}

export interface Model {
    friendlyName: string
    reducer: ReducerFunction<any, any>
    state: any
}

export type IdToModel = { [id: string]: Model }

export type ReducerFunction<TState, TActions> = (
    state: TState,
    action: TActions,
    world: World,
) => TState
