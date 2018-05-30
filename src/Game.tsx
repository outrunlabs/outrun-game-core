import * as React from "react"
import * as ReactDOM from "react-dom"
import { Store, Middleware } from "redux"
import { IEvent, Event } from "oni-types"

import { Action } from "./Actions"
import { DomRenderer } from "./DomRenderer"
import { createWorldStore, WorldState } from "./Store"
import { ReducerFunction, GameModel, RenderFunction } from "./Types"
import { GameView } from "./GameView"
import { World } from "./World"

const UPDATE_RATE = 16

export interface TickEventContext {
    deltaTimeInMilliseconds: number
}

export interface FrameEventContext {
    currentWorld: World
    previousWorld: World
    alpha: number
}

export class Game {
    private _nextModelId = 0
    private _onAction = new Event<Action>()
    private _onStateChangedEvent = new Event<void>()
    private _onTickEvent = new Event<TickEventContext>()
    private _tickFunctionReference: any

    private _lastTick: number = 0
    private _remainder: number = 0

    private _paused: boolean = false
    private _timeMultiplier: number = 1.0
    private _store: Store<WorldState, any>

    private _renderFunction: RenderFunction | null = null

    public static start(): Game {
        const renderer = new DomRenderer()
        const game = new Game(renderer)
        renderer.start(game)
        return game
    }

    public get renderFunction(): RenderFunction | null {
        return this._renderFunction
    }

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

    private constructor(private _renderer: DomRenderer) {
        this._store = createWorldStore()

        this._store.subscribe(() => {
            this._onStateChangedEvent.dispatch()
        })
    }

    public createModel<TState, TActions>(
        friendlyName: string,
        defaultState: TState,
        reducer: ReducerFunction<TState, TActions>,
    ): GameModel<TState, TActions> {
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

    public setView(renderFunction: RenderFunction): void {
        this._renderer.setView(renderFunction)
    }

    private _onFrame(): void {
        const perf = Date.now()

        if (this._lastTick === 0) {
            this._lastTick = perf - UPDATE_RATE
        }

        let delta = (perf - this._lastTick) * this._timeMultiplier + this._remainder

        while (delta >= UPDATE_RATE) {
            this._tickFunction(UPDATE_RATE)
            delta = delta - UPDATE_RATE
        }

        this._remainder = delta
        this._lastTick = perf

        console.log("Remainder: " + this._remainder)
        console.log("Remainder alpha: " + this._remainder / UPDATE_RATE)

        window.requestAnimationFrame(() => this._onFrame())
    }

    private _tickFunction(deltaTime: number): void {
        if (this._paused) {
            return
        }

        this._store.dispatch({
            type: "@@core/TICK",
            deltaTime: deltaTime,
        })

        this._onTickEvent.dispatch({ deltaTimeInMilliseconds: deltaTime })
    }
}
