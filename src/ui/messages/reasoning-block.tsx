"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import type { AgentPlanPhase, AgentStepEvent } from "../../headless/types/chat";

interface ReasoningBlockProps {
  steps: AgentStepEvent[];
  plan?: AgentPlanPhase[];
  isStreaming: boolean;
  elapsedMs?: number;
}

type SkillGroup = {
  skill: AgentStepEvent;
  steps: AgentStepEvent[];
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * ReasoningBlock displays the internal "thinking" process of the AI agent.
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
export function ReasoningBlock({ steps, plan, isStreaming, elapsedMs }: ReasoningBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Group steps by handoff events (triage → skill boundary).
  // Steps before the first handoff are triage internals and are dropped.
  // Returns null when no handoff events exist (flat fallback mode).
  const skillGroups = useMemo<SkillGroup[] | null>(() => {
    const hasHandoff = steps.some((s) => s.type === "handoff");
    if (!hasHandoff) return null;

    const groups: SkillGroup[] = [];
    let current: SkillGroup | null = null;
    for (const step of steps) {
      if (step.type === "handoff") {
        if (current) groups.push(current);
        current = { skill: step, steps: [] };
      } else if (current) {
        current.steps.push(step);
      }
    }
    if (current) groups.push(current);
    return groups;
  }, [steps]);

  const headerLabel = useMemo(() => {
    if (isStreaming) {
      const last = steps[steps.length - 1];
      return `${last?.label || "Thinking"}...`;
    }
    return expanded ? "Hide reasoning" : "Show reasoning";
  }, [isStreaming, steps, expanded]);

  if (!isStreaming && !steps.length && !plan?.length) return null;

  const seconds =
    !isStreaming && typeof elapsedMs === "number"
      ? Math.max(1, Math.round(elapsedMs / 1000))
      : null;

  const toggleSkill = (id: string) =>
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleStep = (id: string) =>
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      className={cn("ais-reasoning-block mb-2 text-xs transition-all duration-200")}
      aria-live="polite"
    >
      {/* Toggle header — whole row is clickable; no chevron. While streaming, an
          emerald gradient sweep + label shimmer convey "in progress" (see CSS). */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "ais-reasoning-toggle group flex w-full flex-col gap-1 rounded-md px-1.5 py-1.5 text-left transition-all",
          "hover:bg-muted/40 active:scale-[0.99]",
          isStreaming ? "text-foreground/90" : "text-muted-foreground hover:text-foreground",
        )}
        aria-expanded={expanded}
      >
        <div className="ais-reasoning-headrow flex w-full items-center gap-3">
          <SparkleIcon
            spinning={isStreaming}
            className={cn(
              "shrink-0",
              isStreaming ? "ais-reasoning-icon" : "ais-reasoning-icon--idle",
            )}
          />

          <span
            className={cn(
              "ais-reasoning-label flex-1 truncate tracking-tight",
              isStreaming && "ais-reasoning-label--active",
            )}
          >
            {headerLabel}
          </span>

          {seconds !== null && <span className="ais-reasoning-seconds">{seconds}s</span>}
        </div>

        {isStreaming && <div className="ais-reasoning-sweep" aria-hidden />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="ais-reasoning-content relative px-1.5 pb-2 pt-1">
          {/* Outer timeline line */}
          <div className="absolute top-2 bottom-4 left-[2rem] w-px bg-gradient-to-b from-border/60 via-border/30 to-transparent" />

          <div className="relative z-10 space-y-4">
            {/* Plan phases */}
            {plan?.length ? (
              <ol className="space-y-2 pb-2">
                {plan.map((phase) => (
                  <li
                    key={phase.id}
                    className="flex items-center gap-2 pl-6 text-muted-foreground/60"
                  >
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                    {phase.label}
                  </li>
                ))}
              </ol>
            ) : null}

            {skillGroups ? (
              /* Two-level view: skill groups from triage */
              <ol className="space-y-1">
                {skillGroups.map((group, groupIdx) => {
                  const isLastGroup = groupIdx === skillGroups.length - 1;
                  // Auto-expand the active skill while streaming; otherwise respect toggle state
                  const isSkillOpen =
                    isStreaming && isLastGroup ? true : expandedSkills.has(group.skill.step_id);
                  // Skill header pulses only while streaming and no tool steps have arrived yet
                  const isSkillCurrent = isStreaming && isLastGroup && group.steps.length === 0;

                  return (
                    <li key={group.skill.step_id} className="ais-reasoning-skill">
                      {/* Level 1: Skill name. A soft vertical guide line (CSS) replaces the
                          expand chevron; the row stays clickable to toggle its steps. */}
                      <button
                        type="button"
                        onClick={() => toggleSkill(group.skill.step_id)}
                        className={cn(
                          "group/skill flex w-full items-center gap-2 rounded py-0.5 text-left transition-colors",
                          "hover:bg-muted/30",
                          isSkillCurrent
                            ? "text-foreground/90"
                            : "font-medium text-foreground/75 hover:text-foreground/90",
                        )}
                      >
                        <span
                          className={cn(
                            "ais-reasoning-label flex-1 truncate tracking-tight",
                            isSkillCurrent && "ais-reasoning-label--active",
                          )}
                        >
                          {group.skill.label}
                        </span>
                      </button>

                      {/* Level 2: Tool steps within the skill */}
                      {isSkillOpen && group.steps.length > 0 && (
                        <div className="relative ml-6 mt-0.5 pb-1">
                          {/* Inner timeline line */}
                          <div className="absolute bottom-0 left-[0.625rem] top-1 w-px bg-gradient-to-b from-border/40 via-border/20 to-transparent" />

                          <ol className="space-y-1.5">
                            {group.steps.map((step, stepIdx) => {
                              const isCurrentStep =
                                isStreaming && isLastGroup && stepIdx === group.steps.length - 1;
                              const hasDetail = !!step.detail;
                              const isStepOpen = expandedSteps.has(step.step_id);

                              return (
                                <li key={step.step_id} className="relative pl-5">
                                  {hasDetail ? (
                                    /* Collapsible step (has Level 3 detail) */
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => toggleStep(step.step_id)}
                                        className="flex w-full items-center gap-2 py-0.5 text-left transition-colors hover:text-foreground/70"
                                      >
                                        <ChevronDown
                                          className={cn(
                                            "h-2.5 w-2.5 shrink-0 text-muted-foreground/30 transition-transform duration-150",
                                            !isStepOpen && "-rotate-90",
                                          )}
                                          aria-hidden
                                        />
                                        <span
                                          className={cn(
                                            "flex-1 truncate tracking-tight",
                                            isCurrentStep
                                              ? "animate-pulse text-foreground/90"
                                              : "text-muted-foreground/70",
                                          )}
                                        >
                                          {step.label}
                                        </span>
                                        {typeof step.duration_ms === "number" && !isStreaming && (
                                          <span className="shrink-0 font-mono text-[9px] text-muted-foreground/30 tabular-nums">
                                            {formatDuration(step.duration_ms)}
                                          </span>
                                        )}
                                      </button>
                                      {/* Level 3: detail lines */}
                                      {isStepOpen && (
                                        <div className="ml-5 mt-0.5 space-y-0.5 text-[10px] leading-relaxed text-muted-foreground/40">
                                          {step.detail!.split("\n").map((line, i) => (
                                            <div key={i}>{line}</div>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    /* Non-collapsible step */
                                    <div className="flex items-center gap-2 py-0.5">
                                      <div className="w-2.5 shrink-0" />
                                      <span
                                        className={cn(
                                          "flex-1 truncate tracking-tight",
                                          isCurrentStep
                                            ? "animate-pulse text-foreground/90"
                                            : "text-muted-foreground/70",
                                        )}
                                      >
                                        {step.label}
                                      </span>
                                      {typeof step.duration_ms === "number" && !isStreaming && (
                                        <span className="shrink-0 font-mono text-[9px] text-muted-foreground/30 tabular-nums">
                                          {formatDuration(step.duration_ms)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      )}
                    </li>
                  );
                })}

                {!isStreaming && steps.length > 0 && (
                  <li className="flex items-center gap-2 py-0.5 pl-6 opacity-60">
                    <div className="w-3 shrink-0" />
                    <span className="tracking-tight text-muted-foreground/80">
                      Reasoning complete
                    </span>
                  </li>
                )}
              </ol>
            ) : (
              /* Flat fallback — no triage / no handoff events */
              <ol className="space-y-3">
                {steps.map((step, index) => {
                  const isCurrentStep = isStreaming && index === steps.length - 1;
                  return (
                    <li
                      key={step.step_id}
                      className={cn(
                        "group relative flex items-start gap-3 transition-opacity duration-200",
                        !isCurrentStep && !isStreaming
                          ? "opacity-70 hover:opacity-100"
                          : "opacity-100",
                      )}
                    >
                      <div className="w-2 shrink-0" />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "truncate tracking-tight",
                              isCurrentStep
                                ? "animate-pulse text-foreground/90"
                                : "text-muted-foreground/80",
                            )}
                          >
                            {step.label}
                          </span>
                          {typeof step.duration_ms === "number" && !isStreaming && (
                            <span className="shrink-0 font-mono text-[9px] text-muted-foreground/30 tabular-nums">
                              {formatDuration(step.duration_ms)}
                            </span>
                          )}
                        </div>
                        {step.detail && (
                          <span className="truncate text-[10px] leading-tight text-muted-foreground/40">
                            {step.detail}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
                {!isStreaming && steps.length > 0 && (
                  <li className="flex items-start gap-3 opacity-60">
                    <div className="w-2 shrink-0" />
                    <span className="tracking-tight text-muted-foreground/80">
                      Reasoning complete
                    </span>
                  </li>
                )}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SparkleIcon({ spinning, className }: { spinning: boolean; className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn(spinning && "ais-spin animate-spin", className)}
    >
      <path d="M12 1L9.5 9.5L1 12L9.5 14.5L12 23L14.5 14.5L23 12L14.5 9.5Z" />
    </svg>
  );
}
