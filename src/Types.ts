import { Action } from "./Actions"

export interface Universe<T> {
    world: T

    // other stuff we keep track of
}

export interface RenderEventContext<T> {
    nextWorld: T
    previousWorld: T
    alpha: number
}

export type RenderFunction<T> = (renderContext: RenderEventContext<T>) => JSX.Element

export type InterpolationFunction<T> = (renderContext: RenderEventContext<T>) => T

export interface GameModelStateChangedEventArgs<TState> {
    oldState: TState
    newState: TState
}

export type DispatchFunction = (action: Action) => void

export type Effect = (dispatch: DispatchFunction) => void

export type ReducerFunction<TState, TWorld> = (
    state: TState,
    action: Action,
    universe: Universe<TWorld>,
) => TState | [TState, Effect]
