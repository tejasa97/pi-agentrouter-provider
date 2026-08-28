import {
	anthropicMessagesApi,
	createProvider,
	envApiKeyAuth,
	openAICompletionsApi,
	type Provider,
} from "@earendil-works/pi-ai/compat";
import {
	ENV_API_KEY,
	PROVIDER_ID,
	PROVIDER_NAME,
	buildModels,
	resolveEndpoints,
	type AgentRouterApi,
} from "./models.ts";

export function createAgentRouterProvider(
	env: NodeJS.ProcessEnv = process.env,
): Provider<AgentRouterApi> {
	const endpoints = resolveEndpoints(env);
	return createProvider({
		id: PROVIDER_ID,
		name: PROVIDER_NAME,
		baseUrl: endpoints.openaiBaseUrl,
		auth: {
			apiKey: envApiKeyAuth("AgentRouter API key", [ENV_API_KEY]),
		},
		models: buildModels(endpoints),
		api: {
			"openai-completions": openAICompletionsApi(),
			"anthropic-messages": anthropicMessagesApi(),
		},
	});
}
