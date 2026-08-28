import type { Model } from "@earendil-works/pi-ai";

export const PROVIDER_ID = "agentrouter";
export const PROVIDER_NAME = "AgentRouter";
export const ENV_API_KEY = "AGENTROUTER_API_KEY";
export const ENV_BASE_URL = "AGENTROUTER_BASE_URL";
export const ENV_ANTHROPIC_BASE_URL = "AGENTROUTER_ANTHROPIC_BASE_URL";
export const DEFAULT_BASE_URL = "https://agentrouter.org/v1";
export const DEFAULT_ANTHROPIC_BASE_URL = "https://agentrouter.org";
export const GLM_53_MODEL_ID = "glm-5.3";

export type AgentRouterApi = "openai-completions" | "anthropic-messages";
export type AgentRouterModel = Model<AgentRouterApi>;

export type AgentRouterEndpoints = {
	openaiBaseUrl: string;
	anthropicBaseUrl: string;
};

const ZERO_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

const GLM_COMPAT = {
	supportsStore: false,
	supportsDeveloperRole: false,
	supportsReasoningEffort: true,
	maxTokensField: "max_tokens",
	thinkingFormat: "zai",
	zaiToolStream: true,
} as const satisfies NonNullable<Model<"openai-completions">["compat"]>;

const GPT_COMPAT = {
	supportsStore: false,
	supportsDeveloperRole: false,
	supportsReasoningEffort: true,
	maxTokensField: "max_tokens",
} as const satisfies NonNullable<Model<"openai-completions">["compat"]>;

const OPUS_46_COMPAT = {
	supportsEagerToolInputStreaming: false,
	forceAdaptiveThinking: true,
} as const satisfies NonNullable<Model<"anthropic-messages">["compat"]>;

const OPUS_47_COMPAT = {
	supportsEagerToolInputStreaming: false,
	forceAdaptiveThinking: true,
	supportsTemperature: false,
} as const satisfies NonNullable<Model<"anthropic-messages">["compat"]>;

function stripTrailingSlash(url: string): string {
	return url.replace(/\/+$/, "");
}

export function resolveOpenAIBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
	const override = env[ENV_BASE_URL]?.trim();
	if (override) return stripTrailingSlash(override);
	return DEFAULT_BASE_URL;
}

export function resolveAnthropicBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
	const override = env[ENV_ANTHROPIC_BASE_URL]?.trim();
	if (override) return stripTrailingSlash(override);
	return DEFAULT_ANTHROPIC_BASE_URL;
}

export function resolveBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
	return resolveOpenAIBaseUrl(env);
}

export function resolveEndpoints(env: NodeJS.ProcessEnv = process.env): AgentRouterEndpoints {
	return {
		openaiBaseUrl: resolveOpenAIBaseUrl(env),
		anthropicBaseUrl: resolveAnthropicBaseUrl(env),
	};
}

function openaiCompletionsModel(input: {
	id: string;
	name: string;
	baseUrl: string;
	input: Model<"openai-completions">["input"];
	contextWindow: number;
	maxTokens: number;
	thinkingLevelMap: NonNullable<Model<"openai-completions">["thinkingLevelMap"]>;
	compat: NonNullable<Model<"openai-completions">["compat"]>;
}): Model<"openai-completions"> {
	return {
		id: input.id,
		name: input.name,
		api: "openai-completions",
		provider: PROVIDER_ID,
		baseUrl: input.baseUrl,
		reasoning: true,
		thinkingLevelMap: input.thinkingLevelMap,
		input: input.input,
		cost: { ...ZERO_COST },
		compat: { ...input.compat },
		contextWindow: input.contextWindow,
		maxTokens: input.maxTokens,
	};
}

function anthropicMessagesModel(input: {
	id: string;
	name: string;
	baseUrl: string;
	thinkingLevelMap: NonNullable<Model<"anthropic-messages">["thinkingLevelMap"]>;
	compat: NonNullable<Model<"anthropic-messages">["compat"]>;
}): Model<"anthropic-messages"> {
	return {
		id: input.id,
		name: input.name,
		api: "anthropic-messages",
		provider: PROVIDER_ID,
		baseUrl: input.baseUrl,
		reasoning: true,
		thinkingLevelMap: input.thinkingLevelMap,
		input: ["text", "image"],
		cost: { ...ZERO_COST },
		compat: { ...input.compat },
		contextWindow: 1_000_000,
		maxTokens: 128_000,
	};
}

export function buildGlm53Model(baseUrl: string): Model<"openai-completions"> {
	return openaiCompletionsModel({
		id: GLM_53_MODEL_ID,
		name: "GLM-5.3",
		baseUrl,
		input: ["text"],
		contextWindow: 1_000_000,
		maxTokens: 131_072,
		thinkingLevelMap: {
			off: null,
			minimal: null,
			low: "low",
			medium: null,
			high: "high",
			xhigh: null,
			max: "max",
		},
		compat: GLM_COMPAT,
	});
}

export function buildModels(endpoints: AgentRouterEndpoints): readonly AgentRouterModel[] {
	const { openaiBaseUrl, anthropicBaseUrl } = endpoints;
	return [
		anthropicMessagesModel({
			id: "claude-opus-4-6",
			name: "Claude Opus 4.6",
			baseUrl: anthropicBaseUrl,
			thinkingLevelMap: { max: "max" },
			compat: OPUS_46_COMPAT,
		}),
		anthropicMessagesModel({
			id: "claude-opus-4-7",
			name: "Claude Opus 4.7",
			baseUrl: anthropicBaseUrl,
			thinkingLevelMap: { xhigh: "xhigh", max: "max" },
			compat: OPUS_47_COMPAT,
		}),
		anthropicMessagesModel({
			id: "claude-opus-4-8",
			name: "Claude Opus 4.8",
			baseUrl: anthropicBaseUrl,
			thinkingLevelMap: { xhigh: "xhigh", max: "max" },
			compat: OPUS_47_COMPAT,
		}),
		openaiCompletionsModel({
			id: "gpt-5.5",
			name: "GPT-5.5",
			baseUrl: openaiBaseUrl,
			input: ["text", "image"],
			contextWindow: 272_000,
			maxTokens: 128_000,
			thinkingLevelMap: {
				off: "none",
				minimal: null,
				low: "low",
				medium: "medium",
				high: "high",
				xhigh: "xhigh",
				max: null,
			},
			compat: GPT_COMPAT,
		}),
		openaiCompletionsModel({
			id: "gpt-5.6",
			name: "GPT-5.6",
			baseUrl: openaiBaseUrl,
			input: ["text", "image"],
			contextWindow: 1_050_000,
			maxTokens: 128_000,
			thinkingLevelMap: {
				off: null,
				minimal: null,
				low: "low",
				medium: "medium",
				high: "high",
				xhigh: "xhigh",
				max: "max",
			},
			compat: GPT_COMPAT,
		}),
		openaiCompletionsModel({
			id: "glm-5.2",
			name: "GLM-5.2",
			baseUrl: openaiBaseUrl,
			input: ["text"],
			contextWindow: 1_000_000,
			maxTokens: 131_072,
			thinkingLevelMap: {
				off: "none",
				minimal: null,
				low: null,
				medium: null,
				high: "high",
				xhigh: null,
				max: "max",
			},
			compat: GLM_COMPAT,
		}),
		buildGlm53Model(openaiBaseUrl),
	];
}

export const CATALOG_MODEL_IDS = [
	"claude-opus-4-6",
	"claude-opus-4-7",
	"claude-opus-4-8",
	"gpt-5.5",
	"gpt-5.6",
	"glm-5.2",
	"glm-5.3",
] as const;
