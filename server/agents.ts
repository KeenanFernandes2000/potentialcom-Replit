// The single place agent bot IDs live. The browser only ever sends an
// agentKey ("ruby"); bot IDs are resolved here, server-side.
export interface AgentConfig {
  botId: string;
}

export const AGENTS: Record<string, AgentConfig> = {
  ruby: { botId: process.env.RUBY_BOT_ID ?? "6a056e4ece71ae96a167f826" },
  // Future: vera, ayla, lumi — one line each.
};

export function getAgent(key: string): AgentConfig | undefined {
  return AGENTS[key];
}

export const POTENTIAL_API_BASE = "https://api.potential.com";
