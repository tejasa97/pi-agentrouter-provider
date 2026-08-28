import {
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
	resolveBaseUrl,
} from "./models.ts";

export function createAgentRouterProvider(env: NodeJS.ProcessEnv = process.env): Provider<"openai-completions"> {
	const baseUrl = resolveBaseUrl(env);
	return createProvider({
		id: PROVIDER_ID,
		name: PROVIDER_NAME,
		baseUrl,
		auth: {
			apiKey: envApiKeyAuth("AgentRouter API key", [ENV_API_KEY]),
		},
		models: buildModels(baseUrl),
		api: openAICompletionsApi(),
	});
}
