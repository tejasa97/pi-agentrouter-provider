import assert from "node:assert/strict";
import test from "node:test";

import agentRouterProvider, {
	CATALOG_MODEL_IDS,
	DEFAULT_ANTHROPIC_BASE_URL,
	DEFAULT_BASE_URL,
	ENV_ANTHROPIC_BASE_URL,
	ENV_API_KEY,
	ENV_BASE_URL,
	GLM_53_MODEL_ID,
	PROVIDER_ID,
	PROVIDER_NAME,
	createAgentRouterProvider,
} from "../extensions/agentrouter/index.ts";

function capturePi() {
	const registrations = [];
	return {
		registrations,
		pi: {
			registerProvider(provider) {
				registrations.push(provider);
			},
		},
	};
}

test("createAgentRouterProvider registers native /login API-key auth and the full catalog", () => {
	const provider = createAgentRouterProvider({});
	assert.equal(provider.id, PROVIDER_ID);
	assert.equal(provider.name, PROVIDER_NAME);
	assert.equal(provider.baseUrl, DEFAULT_BASE_URL);
	assert.equal(provider.auth.apiKey.name, "AgentRouter API key");
	assert.equal(typeof provider.auth.apiKey.login, "function");
	assert.equal(typeof provider.auth.apiKey.resolve, "function");
	assert.equal(provider.auth.oauth, undefined);

	const models = provider.getModels();
	assert.deepEqual(
		models.map((model) => model.id),
		[...CATALOG_MODEL_IDS],
	);
	assert.equal(models.find((model) => model.id === GLM_53_MODEL_ID)?.baseUrl, DEFAULT_BASE_URL);
	assert.equal(
		models.find((model) => model.id === "claude-opus-4-6")?.baseUrl,
		DEFAULT_ANTHROPIC_BASE_URL,
	);
	assert.equal(models.find((model) => model.id === "claude-opus-4-6")?.api, "anthropic-messages");
	assert.equal(models.find((model) => model.id === "gpt-5.5")?.api, "openai-completions");
});

test("AGENTROUTER_BASE_URL overrides OpenAI models only", () => {
	const openaiBaseUrl = "https://gateway.example/v1";
	const provider = createAgentRouterProvider({ [ENV_BASE_URL]: openaiBaseUrl });
	assert.equal(provider.baseUrl, openaiBaseUrl);
	const models = provider.getModels();
	assert.equal(models.find((model) => model.id === "gpt-5.5")?.baseUrl, openaiBaseUrl);
	assert.equal(models.find((model) => model.id === GLM_53_MODEL_ID)?.baseUrl, openaiBaseUrl);
	assert.equal(
		models.find((model) => model.id === "claude-opus-4-6")?.baseUrl,
		DEFAULT_ANTHROPIC_BASE_URL,
	);
});

test("AGENTROUTER_ANTHROPIC_BASE_URL overrides Opus models only", () => {
	const anthropicBaseUrl = "https://anthropic.example";
	const provider = createAgentRouterProvider({ [ENV_ANTHROPIC_BASE_URL]: anthropicBaseUrl });
	const models = provider.getModels();
	assert.equal(models.find((model) => model.id === "claude-opus-4-8")?.baseUrl, anthropicBaseUrl);
	assert.equal(models.find((model) => model.id === "gpt-5.6")?.baseUrl, DEFAULT_BASE_URL);
});

test("extension factory registers the native provider object", () => {
	const { pi, registrations } = capturePi();
	agentRouterProvider(pi);
	assert.equal(registrations.length, 1);
	assert.equal(registrations[0].id, PROVIDER_ID);
	assert.equal(registrations[0].name, PROVIDER_NAME);
	assert.deepEqual(
		registrations[0].getModels().map((model) => model.id),
		[...CATALOG_MODEL_IDS],
	);
});

test("API-key auth stores a credential from /login and prefers it over the env var", async () => {
	const provider = createAgentRouterProvider({});
	const credential = await provider.auth.apiKey.login({
		signal: AbortSignal.timeout(1000),
		prompt: async () => "ak-from-login",
	});
	assert.deepEqual(credential, { type: "api_key", key: "ak-from-login" });

	const stored = await provider.auth.apiKey.resolve({
		ctx: { env: async () => "ak-from-env" },
		credential,
		signal: AbortSignal.timeout(1000),
	});
	assert.equal(stored.source, "stored credential");
	assert.equal(stored.auth.apiKey, "ak-from-login");

	const fromEnv = await provider.auth.apiKey.resolve({
		ctx: { env: async (name) => (name === ENV_API_KEY ? "ak-from-env" : undefined) },
		signal: AbortSignal.timeout(1000),
	});
	assert.equal(fromEnv.source, ENV_API_KEY);
	assert.equal(fromEnv.auth.apiKey, "ak-from-env");
});
