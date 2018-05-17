import * as React from "react"
import { Store } from "redux"

import { Game } from "./Game"
import { createWorldStore, WorldState, DefaultWorldState } from "./Store"
import { RenderFunction } from "./Types"
import { World } from "./World"

export interface GameViewProps {
    game: Game
    render: (world: World) => JSX.Element
}

export interface GameViewState {
    world: World
}

export class GameView extends React.PureComponent<GameViewProps, GameViewState> {
    private _subscription: any
    private _isMounted: boolean = false
    private _isPendingAnimationFrame: boolean = false

    constructor(props: GameViewProps) {
        super(props)

        this.state = {
            world: DefaultWorldState,
        }
    }

    public componentDidMount(): void {
        this._isMounted = true
        this._requestFrame()
    }

    public componentWillUnmount(): void {
        this._isMounted = false
    }

    public render(): JSX.Element {
        return this.props.render(this.state.world)
    }

    private _requestFrame(): void {
        if (this._isMounted && !this._isPendingAnimationFrame) {
            this._isPendingAnimationFrame = true
            window.requestAnimationFrame(() => this._render())
        }
    }

    private _render(): void {
        const latestWorld = this.props.game.getWorld()
        if (latestWorld !== this.state.world) {
            this.setState({
                world: latestWorld,
            })
        }
        this._isPendingAnimationFrame = false

        this._requestFrame()
    }
}
