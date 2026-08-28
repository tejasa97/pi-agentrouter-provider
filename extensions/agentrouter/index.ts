import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createAgentRouterProvider } from "./provider.ts";

export default function agentRouterProvider(pi: ExtensionAPI): void {
	pi.registerProvider(createAgentRouterProvider());
}

export {
	DEFAULT_BASE_URL,
	ENV_API_KEY,
	ENV_BASE_URL,
	GLM_53_MODEL_ID,
	PROVIDER_ID,
	PROVIDER_NAME,
	buildGlm53Model,
	buildModels,
	resolveBaseUrl,
} from "./models.ts";
export { createAgentRouterProvider } from "./provider.ts";
