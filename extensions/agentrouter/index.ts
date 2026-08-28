import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createAgentRouterProvider } from "./provider.ts";

export default function agentRouterProvider(pi: ExtensionAPI): void {
	pi.registerProvider(createAgentRouterProvider());
}

export {
	CATALOG_MODEL_IDS,
	DEFAULT_ANTHROPIC_BASE_URL,
	DEFAULT_BASE_URL,
	ENV_ANTHROPIC_BASE_URL,
	ENV_API_KEY,
	ENV_BASE_URL,
	GLM_53_MODEL_ID,
	PROVIDER_ID,
	PROVIDER_NAME,
	buildGlm53Model,
	buildModels,
	resolveAnthropicBaseUrl,
	resolveBaseUrl,
	resolveEndpoints,
	resolveOpenAIBaseUrl,
} from "./models.ts";
export { createAgentRouterProvider } from "./provider.ts";
