export interface World {}

export namespace World {
    export const getModelState = <T>(world: World, modelName: string): T => {
        return (world as any).models[modelName] as T
    }
}
