import { AgentChat } from "@/components/agent/AgentChat";
import { rubyToolRegistry } from "./rubyToolRegistry";

// Ruby-specific binding of the generic AgentChat panel.
export function RubyChat() {
  return <AgentChat agentKey="ruby" registry={rubyToolRegistry} />;
}
