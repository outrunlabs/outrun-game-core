*   Limit number of states we store (modify for debug vs prod)
    *   Do these states need to be held on by the store? Perhaps that could be moved to an external responsibility
*   Time travel debugging:
    *   Get list of all states
    *   Set to previous state + pause
    *   Resume
*   Add interpolation logic + tests
    *   Interpolator should run w/ frame
