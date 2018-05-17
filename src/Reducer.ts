import { World } from "./World"
import { GameActions, NullAction } from "./Actions"
import { WorldState, DefaultWorldState } from "./Store"
import { ReducerFunction, IdToModel, Model } from "./Types"

export default (state: WorldState = DefaultWorldState, action: GameActions): WorldState => {
    if (action.type === "@@core/NULL") {
        return state
    }

    const newState = {
        ...state,
        models: modelsReducer(state.models, action, state),
    }

    switch (action.type) {
        case "@@core/TICK": {
            return {
                ...newState,
                totalElapsedTime: state.totalElapsedTime + action.deltaTime,
            }
        }
        default:
            return newState
    }
}

const modelsReducer = (models: IdToModel, action: GameActions, world: World): IdToModel => {
    switch (action.type) {
        case "@@core/CREATE_MODEL":
            return {
                ...models,
                [action.id]: {
                    friendlyName: action.friendlyName,
                    state: action.state,
                    reducer: action.reducer,
                },
            }

        default:
            const newModels = {
                ...models,
            }

            Object.keys(models).forEach(key => {
                const model = models[key]
                newModels[key] = modelReducer(model, action, world)
            })

            return newModels
    }
}

const modelReducer = (model: Model, action: any, world: World): Model => {
    const newState = model.reducer(model.state, action, world)

    if (newState === model.state) {
        return model
    } else {
        return {
            ...model,
            state: newState,
        }
    }
}
