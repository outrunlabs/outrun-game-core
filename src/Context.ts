import { RenderEventContext } from "./Types"

export const setContext = (context: RenderEventContext) => {
    ;(window as any)["__outrun_render_context__"] = context
}

export const getContext = (): RenderEventContext => {
    return (window as any)["__outrun_render_context__"]
}
