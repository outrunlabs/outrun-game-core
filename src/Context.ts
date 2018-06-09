import { RenderEventContext } from "./Types"

export const setContext = (context: RenderEventContext) => {
    window["__outrun_render_context__"] = context
}

export const getContext = (): RenderEventContext => {
    return window["__outrun_render_context__"]
}
