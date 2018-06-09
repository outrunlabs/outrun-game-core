import * as React from "react"

import { World } from "./World"
import { getContext } from "./Context"
import { RenderEventContext } from "./Types"

export type WorldToProps<T> = (world: World, renderEventContext: RenderEventContext) => T

export const connectToWorld = (mapWorldToProps: WorldToProps<any>) => (
    Component: React.ComponentType<any>,
): React.ComponentType<any> => {
    return class ConnectedComponent extends React.Component<{}, {}> {
        public render(): JSX.Element {
            const currentWorld = getContext()
            const mappedProps = mapWorldToProps(currentWorld.previousWorld, currentWorld)

            return <Component {...mappedProps} />
        }
    }
}
