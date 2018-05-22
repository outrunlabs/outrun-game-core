import * as React from "react"
import * as ReactDOM from "react-dom"
import { Store, Middleware } from "redux"
import { IEvent, Event } from "oni-types"

import { Action } from "./Actions"
import { createWorldStore, WorldState } from "./Store"
import { ReducerFunction, GameModel, RenderFunction } from "./Types"
import { Game } from "./Game"
import { GameView } from "./GameView"
import { World } from "./World"

export class DomRenderer {
    private _element: HTMLElement | null = null
    private _game: Game | null = null

    public start(game: Game): void {
        this._game = game
        const element = document.createElement("div")
        element.id = "game-root"
        element.style.position = "absolute"
        element.style.top = "0px"
        element.style.left = "0px"
        element.style.right = "0px"
        element.style.bottom = "0px"
        document.body.appendChild(element)
        this._element = element
        this.setView(() => {
            return (
                <div
                    style={{
                        backgroundColor: "#6495ed",
                        color: "white",
                        width: "100%",
                        height: "100%",
                        display: "Flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <span style={{ textAlign: "center" }}>
                        This is a boring game... Spice it up with your own View!
                    </span>
                </div>
            )
        })
    }

    public setView(renderFunction: RenderFunction): void {
        if (this._game) {
            ReactDOM.render(<GameView game={this._game} render={renderFunction} />, this._element)
        }
    }
}
