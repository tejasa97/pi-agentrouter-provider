# @tejasa97/pi-agentrouter-provider

Pi package that registers the `agentrouter` provider for [AgentRouter](https://agentrouter.org).

v1 ships **GLM-5.3** on AgentRouter's OpenAI-compatible Chat Completions endpoint. Auth is an API key stored by `/login` in `~/.pi/agent/auth.json`, with `AGENTROUTER_API_KEY` as a fallback.

AgentRouter's public Pi docs still show `glm-5.2`. This package sends the model id `glm-5.3`. Confirm that id in [the personal console](https://agentrouter.org/console/personal) or [token page](https://agentrouter.org/console/token) if a request 404s.

Do not mix this with AgentRouter's Anthropic Messages URL (`https://agentrouter.org`, no `/v1`). That path is for Claude Opus. Adding Opus later means a second model with `api: "anthropic-messages"` and `baseUrl: "https://agentrouter.org"`, still one `/login`.

## Install

```sh
pi install git:github.com/tejasa97/pi-agentrouter-provider
```

Or from a local clone:

```sh
pi install /absolute/path/to/pi-agentrouter-provider
```

## Usage

1. Create an API key at https://agentrouter.org/console/token
2. In Pi: `/login` → **Use an API key** → **AgentRouter**
3. `/model` → `agentrouter/glm-5.3`

The key is written to `~/.pi/agent/auth.json` under `agentrouter`. Stored credentials win over the environment.

You can skip `/login` by exporting the key in the shell that starts Pi:

```sh
export AGENTROUTER_API_KEY="your-key"
pi
```

Optional override if you need a different gateway:

```sh
export AGENTROUTER_BASE_URL="https://agentrouter.org/v1"
```

If Ctrl+P cycling ignores the new model, add `agentrouter/glm-5.3` to `enabledModels` in `~/.pi/agent/settings.json`. `/model` still lists it without that.

## Models

| Id | API | Base URL |
| --- | --- | --- |
| `glm-5.3` | `openai-completions` | `https://agentrouter.org/v1` |

Thinking uses Pi's Z.AI GLM-5.3 flags (`thinkingFormat: "zai"`, `zaiToolStream: true`, `supportsDeveloperRole: false`). AgentRouter is a gateway. If a live request rejects `thinking` or `tool_stream`, those compat fields are the first thing to change.

## Testing

```sh
npm test
```
