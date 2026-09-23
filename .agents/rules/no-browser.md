# Browser Constraints

- **Do NOT open the browser**: Under no circumstances should the agent launch a browser, open URLs in the browser, or invoke `browser_subagent` unless the user explicitly and directly commands it in their prompt.
- Verify all frontend and backend work using terminal commands (e.g., `tsc --noEmit`, `curl`), unit tests, and source code analysis.
