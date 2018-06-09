import * as React from "react"
import * as ReactDOM from "react-dom"
import { Store, Middleware } from "redux"
import { IEvent, Event } from "oni-types"

import { Action } from "./Actions"
import { DomRenderer } from "./DomRenderer"
import { createWorldStore, WorldState } from "./Store"
import { ReducerFunction, GameModel, RenderFunction, RenderEventContext } from "./Types"
import { GameView } from "./GameView"
import { World } from "./World"
import { isBrowser } from "./Utility"

export type Seconds = number

export interface TickEventContext {
    deltaTime: Seconds
    tick: number
}

export class Game {
    private _onAction = new Event<Action>()
    private _onStateChangedEvent = new Event<void>()
    private _onTickEvent = new Event<TickEventContext>()
    private _onFrameEvent = new Event<RenderEventContext>()
    private _tickFunctionReference: any

    private _targetUpdateTime: number = 1000 / (60 * 1000)

    private _tick: number = 0

    private _lastTickTime: number = 0
    private _frameRemainderTime: number = 0

    private _paused: boolean = false
    private _timeMultiplier: number = 1.0
    private _store: Store<WorldState, any>

    private _renderFunction: RenderFunction | null = null

    public static start(): Game {
        const renderer = isBrowser() ? new DomRenderer() : null
        const game = new Game(renderer)

        if (renderer) {
            renderer.start(game)
        }

        return game
    }

    public setUpdateRate(updateRate: number): void {
        this._targetUpdateTime = 1000 / (updateRate * 1000)
    }

    public get onAction(): IEvent<Action> {
        return this._onAction
    }

    public get onFrame(): IEvent<RenderEventContext> {
        return this._onFrameEvent
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

    private constructor(private _renderer: DomRenderer | null) {
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
        this.dispatch({
            type: "@@core/CREATE_MODEL",
            friendlyName,
            id: friendlyName,
            state: defaultState,
            reducer,
        })

        const selector = (world: World): TState => {
            const worldState = world as WorldState
            const model = worldState.models[friendlyName]

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
        this._lastTickTime = Date.now() / 1000

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
        // TODO: Stub out renderer for server
        if (this._renderer) {
            this._renderer.setView(renderFunction)
        }
    }

    private _onFrame(): void {
        const perf = Date.now() / 1000

        const UPDATE_TIME = this._targetUpdateTime

        if (this._lastTickTime === 0) {
            this._lastTickTime = perf - UPDATE_TIME
        }

        let previousWorld = this._store.getState()

        let delta = (perf - this._lastTickTime) * this._timeMultiplier + this._frameRemainderTime

        while (delta >= UPDATE_TIME) {
            this._tickFunction(UPDATE_TIME)
            delta = delta - UPDATE_TIME
        }

        this._frameRemainderTime = delta
        this._lastTickTime = perf

        this._onFrameEvent.dispatch({
            previousWorld,
            nextWorld: this._store.getState(),
            alpha: this._frameRemainderTime / UPDATE_TIME,
        })

        if (isBrowser()) {
            window.requestAnimationFrame(() => this._onFrame())
        } else {
            setTimeout(() => this._onFrame())
        }
    }

    private _tickFunction(deltaTime: number): void {
        if (this._paused) {
            return
        }

        this._tick++

        this._store.dispatch({
            type: "@@core/TICK",
            deltaTime: deltaTime,
            tick: this._tick,
        })

        this._onTickEvent.dispatch({ deltaTime: deltaTime, tick: this._tick })
    }
}
