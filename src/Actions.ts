export type Entity = any

export const NullAction = { type: "@@core/NULL" }

import { ReducerFunction } from "./Types"

export type Action = {
    type: string
}

export type GameActions =
    | {
          type: "@@core/TICK"
          deltaTime: number
      }
    | {
          type: "@@core/NULL"
      }
    | {
          type: "@@core/CREATE_MODEL"
          friendlyName: string
          id: string
          state: any
          reducer: ReducerFunction<any, any>
      }
