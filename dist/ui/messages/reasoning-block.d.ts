import type { AgentPlanPhase, AgentStepEvent } from "../../headless/types/chat";
interface ReasoningBlockProps {
    steps: AgentStepEvent[];
    plan?: AgentPlanPhase[];
    isStreaming: boolean;
    elapsedMs?: number;
}
/**
 * ReasoningBlock displays the internal "thinking" process of the AI agent.
 *
 * NOTE ON STYLING:
 * Every element here carries an `ais-`-prefixed class backed by real CSS in
 * `src/styles/styles-no-base.css`. Do not lay this component out with Tailwind
 * utilities — the SDK ships static CSS only, so utilities are dead classes in
 * any host that does not compile Tailwind over `node_modules` (which Tailwind v4
 * does not do by default, since `node_modules` is typically gitignored).
 *
 * NOTE ON DUPLICATE LABELS:
 * You may see multiple occurrences of the same label (e.g., "Recalling context...") in the timeline.
 * This is expected behavior due to the backend's execution architecture:
 *
 * 1. Dual Event Emission: The backend often emits both a general "status" event and a specific
 *    "tool_call" event for the same action. Both are rendered as distinct steps.
 * 2. ReAct Loop Iterations: The agent operates in a Reason+Act loop. If it needs more info,
 *    it will run another cycle, generating a new set of steps even if the labels are similar.
 * 3. Randomized Phrase Pool: Labels are picked from a pool of phrases for each tool.
 *    Small pools or repeated actions can lead to phrase repetition.
 * 4. Distinct Execution Events: Every line represents a unique event with its own tracking ID
 *    and duration, even if the user-facing label is identical.
 */
export declare function ReasoningBlock({ steps, plan, isStreaming, elapsedMs }: ReasoningBlockProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=reasoning-block.d.ts.map