import * as React from "react"
import * as ReactDOM from "react-dom"
import { Store, Middleware } from "redux"
import { IEvent, Event } from "oni-types"

import { Action } from "./Actions"
import {
    ReducerFunction,
    RenderFunction,
    RenderEventContext,
    DispatchFunction,
    Effect,
} from "./Types"
import { isBrowser } from "./Utility"

export type Seconds = number

export interface TickEventContext {
    deltaTime: Seconds
    tick: number
}

export type State<T> = {
    action: Action
    state: T
}

const noop = () => {}

export class Game<TWorld> {
    private _onAction = new Event<Action>()
    private _onTickEvent = new Event<TickEventContext>()
    private _onFrameEvent = new Event<RenderEventContext<TWorld>>()
    private _tickFunctionReference: any

    private _targetUpdateTime: number = 1000 / (60 * 1000)

    private _tick: number = 0

    private _lastTickTime: number = 0
    private _frameRemainderTime: number = 0

    private _paused: boolean = false
    private _timeMultiplier: number = 1.0

    private _renderers: RenderFunction<TWorld>[] = []

    private _states: State<TWorld>[] = []
    private _reducer: ReducerFunction<TWorld, TWorld>
    private _dispatchFunction: DispatchFunction

    public static create<T>(world: T, reducer: ReducerFunction<T, T>): Game<T> {
        return new Game<T>(world, reducer)
    }

    public setUpdateRate(updateRate: number): void {
        this._targetUpdateTime = 1000 / (updateRate * 1000)
    }

    public get onAction(): IEvent<Action> {
        return this._onAction
    }

    public get onFrame(): IEvent<RenderEventContext<TWorld>> {
        return this._onFrameEvent
    }

    public get onTick(): IEvent<TickEventContext> {
        return this._onTickEvent
    }

    public get isPaused(): boolean {
        return this._paused
    }

    public getWorld(): TWorld {
        return this._states[this._states.length - 1].state
    }

    private constructor(world: TWorld, reducer: ReducerFunction<TWorld, TWorld>) {
        this._states.push({
            state: world,
            action: { type: "@@genesis" },
        })

        this._reducer = reducer

        this._dispatchFunction = (action: Action) => this.dispatch(action)
    }

    public start(): void {
        this._lastTickTime = Date.now() / 1000

        this._onFrame()
    }

    public dispatch(action: any): void {
        const currentState = this.getWorld()

        const result = this._reducer(currentState, action, { world: currentState })

        let [state, effect] = Array.isArray(result) ? result : [result, noop]

        this._runEffect(effect)

        this._onAction.dispatch(action)

        this._states.push({
            state,
            action,
        })
    }

    private _runEffect(effect: Effect): void {
        effect(this._dispatchFunction)
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

    public addRenderer(renderer: RenderFunction<TWorld>): void {
        this._renderers.push(renderer)
    }

    private _onFrame(): void {
        const perf = Date.now() / 1000

        const UPDATE_TIME = this._targetUpdateTime

        if (this._lastTickTime === 0) {
            this._lastTickTime = perf - UPDATE_TIME
        }

        let previousWorld = this.getWorld()

        let delta = (perf - this._lastTickTime) * this._timeMultiplier + this._frameRemainderTime

        while (delta >= UPDATE_TIME) {
            this._tickFunction(UPDATE_TIME)
            delta = delta - UPDATE_TIME
        }

        this._frameRemainderTime = delta
        this._lastTickTime = perf

        // TODO: Add interpolation function here

        this._onFrameEvent.dispatch({
            previousWorld,
            nextWorld: this.getWorld(),
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

        this.dispatch({
            type: "@@core/TICK",
            deltaTime: deltaTime,
            tick: this._tick,
        })

        this._onTickEvent.dispatch({ deltaTime: deltaTime, tick: this._tick })
    }
}
