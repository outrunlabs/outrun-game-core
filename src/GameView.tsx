import * as React from "react"
import { Store } from "redux"

import { Game } from "./Game"
import { createWorldStore, WorldState, DefaultWorldState } from "./Store"
import { RenderFunction, RenderEventContext } from "./Types"
import { World } from "./World"

export interface GameViewProps {
    game: Game
    render: RenderFunction
}

export class GameView extends React.PureComponent<GameViewProps, RenderEventContext> {
    private _subscription: any
    private _isMounted: boolean = false
    private _isPendingAnimationFrame: boolean = false

    constructor(props: GameViewProps) {
        super(props)

        this.state = {
            previousWorld: DefaultWorldState,
            nextWorld: DefaultWorldState,
            alpha: 0,
        }
    }

    public componentDidMount(): void {
        this._subscription = this.props.game.onFrame.subscribe(
            (renderEventContext: RenderEventContext) => this._render(renderEventContext),
        )
    }

    public componentWillUnmount(): void {
        if (this._subscription) {
            this._subscription.dispose()
            this._subscription = null
        }
    }

    public render(): JSX.Element {
        const contexts = this.props.game.contexts
        let elem = this.props.render(this.state)

        contexts.forEach(c => {
            elem = React.createElement(c.contextProvider, { value: c.valueFunc(this.state) }, elem)
        })

        return elem
    }

    private _render(renderEventContext: RenderEventContext): void {
        this.setState(renderEventContext)
    }
}
