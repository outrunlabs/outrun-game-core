import * as React from "react"

import { Event, IEvent } from "oni-types"
import { Game } from "./../src/Game"
import { GameView } from "./../src/GameView"
import { RenderEventContext } from "./../src/Types"

import { connectToWorld } from "./../src/connectToWorld"

import * as TestRenderer from "react-test-renderer"

export class MockGame {
    private _onFrameEvent = new Event<RenderEventContext>()

    public get onFrame(): IEvent<RenderEventContext> {
        return this._onFrameEvent
    }

    public dispatchFrame(rec: RenderEventContext) {
        this._onFrameEvent.dispatch(rec)
    }
}

export class TestComponent extends React.PureComponent<any, {}> {
    public render(): JSX.Element {
        return <div>{this.props.testModel}</div>
    }
}

const ConnectedTestComponent = connectToWorld(world => world)(TestComponent)

describe("connectToWorld", () => {
    it("sends connected value", () => {
        const game: any = new MockGame()
        const view = TestRenderer.create(
            <GameView game={game} render={() => <ConnectedTestComponent />} />,
        )
        const instance = view.root

        const firstWorldState = {
            testModel: "t1",
        }

        game.dispatchFrame({
            previousWorld: firstWorldState,
            nextWorld: firstWorldState,
            alpha: 0,
        })

        expect(instance.findByType("div").children).toEqual(["t1"])

        // Create a new state
        const secondWorldState = {
            testModel: "t2",
        }

        game.dispatchFrame({
            previousWorld: secondWorldState,
            nextWorld: secondWorldState,
            alpha: 0,
        })

        expect(instance.findByType("div").children).toEqual(["t2"])
    })

    it("renders", () => {
        const testRenderer = TestRenderer.create(<div>test</div>)
        const instance = testRenderer.root

        expect(instance.children).toEqual(["test"])
    })
})
