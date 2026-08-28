import assert from "node:assert/strict";
import test from "node:test";

import {
	DEFAULT_BASE_URL,
	ENV_BASE_URL,
	GLM_53_MODEL_ID,
	PROVIDER_ID,
	buildGlm53Model,
	buildModels,
	resolveBaseUrl,
} from "../extensions/agentrouter/models.ts";

test("resolveBaseUrl uses the AgentRouter OpenAI-compatible /v1 endpoint by default", () => {
	assert.equal(resolveBaseUrl({}), DEFAULT_BASE_URL);
	assert.equal(DEFAULT_BASE_URL, "https://agentrouter.org/v1");
});

test("resolveBaseUrl honors AGENTROUTER_BASE_URL and strips trailing slashes", () => {
	assert.equal(
		resolveBaseUrl({ [ENV_BASE_URL]: "https://example.test/v1///" }),
		"https://example.test/v1",
	);
});

test("v1 catalog is GLM-5.3 only, with Z.AI thinking compat on the AgentRouter base URL", () => {
	const models = buildModels(DEFAULT_BASE_URL);
	assert.equal(models.length, 1);

	const model = buildGlm53Model(DEFAULT_BASE_URL);
	assert.equal(model.id, GLM_53_MODEL_ID);
	assert.equal(model.name, "GLM-5.3");
	assert.equal(model.api, "openai-completions");
	assert.equal(model.provider, PROVIDER_ID);
	assert.equal(model.baseUrl, DEFAULT_BASE_URL);
	assert.equal(model.reasoning, true);
	assert.deepEqual(model.input, ["text"]);
	assert.equal(model.contextWindow, 1_000_000);
	assert.equal(model.maxTokens, 131_072);
	assert.deepEqual(model.thinkingLevelMap, {
		off: null,
		minimal: null,
		low: "low",
		medium: null,
		high: "high",
		xhigh: null,
		max: "max",
	});
	assert.deepEqual(model.compat, {
		supportsStore: false,
		supportsDeveloperRole: false,
		supportsReasoningEffort: true,
		maxTokensField: "max_tokens",
		thinkingFormat: "zai",
		zaiToolStream: true,
	});
});
