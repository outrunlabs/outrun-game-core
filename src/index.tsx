import * as React from 'react';
import { Store, Middleware } from "redux"

import { IEvent, Event } from "./../Events";

import { createWorldStore, WorldState, DefaultWorldState, Entity } from './Store'
import { World } from "./World"

import { GameView } from "./GameView"

export type RenderFunction = (world: World) => JSX.Element

export * from "./Actions"
export * from "./Selectors"
export * from "./World"

const UPDATE_RATE = 50

export interface EntityMetadata {
    type: string
    id?: string
}

export interface Entity<TState, TAction> extends EntityMetadata {
    type: string
    id?: string
    state: TState

    reducer?: (previewState: TState, action: TAction) => TState
    update?: (previousState: TState, deltaTime: number, world: World) => TState
}

export interface TickEventContext {
    deltaTimeInMilliseconds: number
}

export type Action = {
    type: string 
}

export interface GameModelStateChangedEventArgs<TState> {
    oldState: TState
    newState: TState
}

export type SelectorFunction<TState> = (world: World) => TState

export interface GameModel<TState, TActions> {
    selector: SelectorFunction<TState>
    onStateChanged(): IEvent<GameModelStateChangedEventArgs<TState>>
}

export type ReducerFunction<TState, TActions> = (state: TState, action: TActions, world: World) => TState

export class Game {

    private _nextModelId = 0

    private _onAction = new Event<void>()
    private _onStateChangedEvent = new Event<void>()
    private _onTickEvent = new Event<TickEventContext>()
    private _tickFunctionReference: any

    private _lastTick: number = 0
    private _remainder: number = 0

    private _paused: boolean = false
    private _timeMultiplier: number = 1.0
    private _store: Store<WorldState, any>

    public get onAction(): IEvent<Action> {
        return this._onAction
    }

    public get onStateChanged(): IEvent<void> {
        return this._onStateChangedEvent
    }

    public get onTick(): IEvent<TickEventContext> {
        return this._onTickEvent
    }

    public get isPaused(): boolean {
        return this._paused
    }

    constructor() {
        this._store = createWorldStore()

        this._store.subscribe(() => {
            this._onStateChangedEvent.dispatch()
        })
    }

    public createModel<TState, TActions>(friendlyName: string, defaultState: TState, reducer: ReducerFunction<TState>): GameModel<TState, TActions> {

        const modelId = this._nextModelId.toString()
        this._nextModelId++

        this.dispatch({
            type: "@@core/CREATE_MODEL",
            friendlyName,
            id: modelId,
            state: defaultState,
            reducer,
        }) 

        const selector = (world: World): TState => {
            const worldState = world as WorldState
            const model = worldState.models[modelId]
            
            if (!model) {
                return defaultState
            } else {
                return model.state
            }
        }

        return {
            selector,
            onStateChanged: null
        }
    }

    public start(): void {
        this._lastTick = Date.now()

        this._onFrame()
    }

    public dispatch(action: any): void {
        this._store.dispatch(action)

        this._onAction.dispatch(action)
    }

    public pause(): void {
        this._paused = true
    }

    public resume(): void {
        this._paused = false
    }

    public setTimeMultiplier(time: number): void {
        this._timeMultiplier = time
    }

    public getWorld(): World {
        return this._store.getState()
    }

    public render(renderFunction: RenderFunction): JSX.Element {
        return <GameView game={this} render={renderFunction} />
    }

    private _onFrame(): void {
        const perf = Date.now()

        if (this._lastTick === 0) {
            this._lastTick = perf - UPDATE_RATE
        }

        let delta = ((perf - this._lastTick) * this._timeMultiplier) + this._remainder

        let maxTicks = 5
        while (delta > UPDATE_RATE && maxTicks >= 0) {
            this._tickFunction(UPDATE_RATE)
            delta = delta - UPDATE_RATE
            maxTicks--
        }

        if (maxTicks <= 0) {
            this._remainder = 0
        } else {
            this._remainder = delta
        }
        this._lastTick = perf

        window.requestAnimationFrame(() => this._onFrame())
    }

    private _tickFunction(deltaTime: number): void {

        if (this._paused) {
            return
        }

        this._store.dispatch({
            type: "TICK",
            deltaTime: deltaTime
        })

        this._onTickEvent.dispatch({ deltaTimeInMilliseconds: deltaTime })
    }
}
