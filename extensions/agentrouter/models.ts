import type { Model } from "@earendil-works/pi-ai";

export const PROVIDER_ID = "agentrouter";
export const PROVIDER_NAME = "AgentRouter";
export const ENV_API_KEY = "AGENTROUTER_API_KEY";
export const ENV_BASE_URL = "AGENTROUTER_BASE_URL";
export const DEFAULT_BASE_URL = "https://agentrouter.org/v1";
export const GLM_53_MODEL_ID = "glm-5.3";

const ZERO_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

/**
 * GLM-5.3 on AgentRouter's OpenAI-compatible Chat Completions endpoint.
 *
 * Thinking/tool-stream flags match Pi's built-in Z.AI GLM-5.3 catalog. AgentRouter
 * is a gateway, so if a later request is rejected for `thinking` / `tool_stream`,
 * drop those compat fields rather than changing the model id.
 */
const GLM_53_COMPAT = {
	supportsStore: false,
	supportsDeveloperRole: false,
	supportsReasoningEffort: true,
	maxTokensField: "max_tokens",
	thinkingFormat: "zai",
	zaiToolStream: true,
} as const satisfies NonNullable<Model<"openai-completions">["compat"]>;

export function resolveBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
	const override = env[ENV_BASE_URL]?.trim();
	if (override) return override.replace(/\/+$/, "");
	return DEFAULT_BASE_URL;
}

export function buildGlm53Model(baseUrl: string): Model<"openai-completions"> {
	return {
		id: GLM_53_MODEL_ID,
		name: "GLM-5.3",
		api: "openai-completions",
		provider: PROVIDER_ID,
		baseUrl,
		reasoning: true,
		thinkingLevelMap: {
			off: null,
			minimal: null,
			low: "low",
			medium: null,
			high: "high",
			xhigh: null,
			max: "max",
		},
		input: ["text"],
		cost: { ...ZERO_COST },
		compat: { ...GLM_53_COMPAT },
		contextWindow: 1_000_000,
		maxTokens: 131_072,
	};
}

export function buildModels(baseUrl: string): readonly Model<"openai-completions">[] {
	return [buildGlm53Model(baseUrl)];
}
