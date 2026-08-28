# @tejasa97/pi-agentrouter-provider

Pi package that registers the `agentrouter` provider for [AgentRouter](https://agentrouter.org).

The catalog is AgentRouter's documented coding models, plus `glm-5.3` (their Pi page still lists `glm-5.2`). Auth is an API key stored by `/login` in `~/.pi/agent/auth.json`, with `AGENTROUTER_API_KEY` as a fallback. One login covers both APIs.

This is a static list from their docs, not a live `/v1/models` fetch. Confirm ids in [the personal console](https://agentrouter.org/console/personal) if a request 404s.

## Install

```sh
pi install npm:@tejasa97/pi-agentrouter-provider
```

Or from git:

```sh
pi install git:github.com/tejasa97/pi-agentrouter-provider
```

## Usage

1. Create an API key at https://agentrouter.org/console/token
2. In Pi: `/login` → **Use an API key** → **AgentRouter**
3. `/model` → `agentrouter/glm-5.3` (or any other catalog id)

The key is written to `~/.pi/agent/auth.json` under `agentrouter`. Stored credentials win over the environment.

You can skip `/login` by exporting the key in the shell that starts Pi:

```sh
export AGENTROUTER_API_KEY="your-key"
pi
```

Optional endpoint overrides. Do not mix the two URLs.

```sh
export AGENTROUTER_BASE_URL="https://agentrouter.org/v1"
export AGENTROUTER_ANTHROPIC_BASE_URL="https://agentrouter.org"
```

If Ctrl+P cycling ignores a model, add `agentrouter/<id>` to `enabledModels` in `~/.pi/agent/settings.json`. `/model` still lists the full catalog without that.

## Models

| Id | API | Base URL |
| --- | --- | --- |
| `claude-opus-4-6` | `anthropic-messages` | `https://agentrouter.org` |
| `claude-opus-4-7` | `anthropic-messages` | `https://agentrouter.org` |
| `claude-opus-4-8` | `anthropic-messages` | `https://agentrouter.org` |
| `gpt-5.5` | `openai-completions` | `https://agentrouter.org/v1` |
| `gpt-5.6` | `openai-completions` | `https://agentrouter.org/v1` |
| `glm-5.2` | `openai-completions` | `https://agentrouter.org/v1` |
| `glm-5.3` | `openai-completions` | `https://agentrouter.org/v1` |

GLM thinking uses Pi's Z.AI flags. Opus uses adaptive thinking and omits `eager_input_streaming` because AgentRouter is a gateway. GPT uses Chat Completions, matching AgentRouter's Pi docs, not the Codex Responses path.

## Testing

```sh
npm test
```
