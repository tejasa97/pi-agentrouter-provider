import assert from "node:assert/strict";
import test from "node:test";

import {
	CATALOG_MODEL_IDS,
	DEFAULT_ANTHROPIC_BASE_URL,
	DEFAULT_BASE_URL,
	ENV_ANTHROPIC_BASE_URL,
	ENV_BASE_URL,
	GLM_53_MODEL_ID,
	PROVIDER_ID,
	buildGlm53Model,
	buildModels,
	resolveAnthropicBaseUrl,
	resolveBaseUrl,
	resolveEndpoints,
} from "../extensions/agentrouter/models.ts";

const defaultEndpoints = {
	openaiBaseUrl: DEFAULT_BASE_URL,
	anthropicBaseUrl: DEFAULT_ANTHROPIC_BASE_URL,
};

test("resolveBaseUrl uses the AgentRouter OpenAI-compatible /v1 endpoint by default", () => {
	assert.equal(resolveBaseUrl({}), DEFAULT_BASE_URL);
	assert.equal(DEFAULT_BASE_URL, "https://agentrouter.org/v1");
	assert.equal(resolveAnthropicBaseUrl({}), DEFAULT_ANTHROPIC_BASE_URL);
	assert.equal(DEFAULT_ANTHROPIC_BASE_URL, "https://agentrouter.org");
});

test("resolveEndpoints honors OpenAI and Anthropic base URL overrides separately", () => {
	assert.equal(
		resolveBaseUrl({ [ENV_BASE_URL]: "https://example.test/v1///" }),
		"https://example.test/v1",
	);
	const endpoints = resolveEndpoints({
		[ENV_BASE_URL]: "https://openai.example/v1/",
		[ENV_ANTHROPIC_BASE_URL]: "https://anthropic.example/",
	});
	assert.deepEqual(endpoints, {
		openaiBaseUrl: "https://openai.example/v1",
		anthropicBaseUrl: "https://anthropic.example",
	});
});

test("catalog is AgentRouter's documented models plus glm-5.3", () => {
	const models = buildModels(defaultEndpoints);
	assert.deepEqual(
		models.map((model) => model.id),
		[...CATALOG_MODEL_IDS],
	);

	const byId = new Map(models.map((model) => [model.id, model]));
	for (const id of ["claude-opus-4-6", "claude-opus-4-7", "claude-opus-4-8"]) {
		const model = byId.get(id);
		assert.equal(model?.api, "anthropic-messages");
		assert.equal(model?.baseUrl, DEFAULT_ANTHROPIC_BASE_URL);
		assert.equal(model?.provider, PROVIDER_ID);
		assert.deepEqual(model?.input, ["text", "image"]);
		assert.equal(model?.compat?.forceAdaptiveThinking, true);
		assert.equal(model?.compat?.supportsEagerToolInputStreaming, false);
	}

	assert.equal(byId.get("claude-opus-4-7")?.compat?.supportsTemperature, false);
	assert.equal(byId.get("claude-opus-4-8")?.compat?.supportsTemperature, false);

	for (const id of ["gpt-5.5", "gpt-5.6", "glm-5.2", GLM_53_MODEL_ID]) {
		const model = byId.get(id);
		assert.equal(model?.api, "openai-completions");
		assert.equal(model?.baseUrl, DEFAULT_BASE_URL);
	}

	const glm53 = buildGlm53Model(DEFAULT_BASE_URL);
	assert.equal(glm53.id, GLM_53_MODEL_ID);
	assert.deepEqual(glm53.compat, {
		supportsStore: false,
		supportsDeveloperRole: false,
		supportsReasoningEffort: true,
		maxTokensField: "max_tokens",
		thinkingFormat: "zai",
		zaiToolStream: true,
	});
});
