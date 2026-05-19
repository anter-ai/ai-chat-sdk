/**
 * Command Registry
 *
 * A module-level singleton that holds all commands surfaced in the Command
 * Center (⌘K palette). Commands are plain objects with an ID, a display label,
 * an optional description, and a callback that runs when the user selects them.
 *
 * Lifecycle
 * ---------
 * Commands are registered once per component mount and removed on unmount so
 * the palette stays in sync with the current UI state:
 *
 *   useEffect(() => {
 *     registerCommand({ id: 'my-action', label: 'My Action', onExecute: () => doSomething() });
 *     return () => unregisterCommand('my-action');
 *   }, []);
 *
 * The registry is shared across the entire widget instance — there is no per-
 * session or per-tenant isolation. Keep IDs unique (e.g. prefix with a
 * namespace: 'shell:', 'plugin:', 'host:').
 */

/** A single entry in the Command Center palette. */
export interface RegisteredCommand {
  /** Stable, unique identifier used for upsert and removal. */
  id: string;
  /** Primary text shown in the palette list. */
  label: string;
  /** Secondary text shown below the label, e.g. a short description of the action. */
  description?: string;
  /** Called when the user selects this command via click or keyboard Enter. */
  onExecute: () => void;
}

// The singleton store. Mutated directly — no React state — because the
// CommandPalette reads it fresh on every render via getCommandRegistry().
const registry: RegisteredCommand[] = [];

/**
 * Add a command to the palette. If a command with the same `id` is already
 * registered it is replaced in-place, so re-registering on React Strict Mode's
 * double-mount does not produce duplicates.
 */
export function registerCommand(cmd: RegisteredCommand): void {
  const existing = registry.findIndex((c) => c.id === cmd.id);
  if (existing >= 0) {
    registry[existing] = cmd;
  } else {
    registry.push(cmd);
  }
}

/**
 * Remove a command by ID. Typically called in the cleanup of the same
 * `useEffect` that registered it, so the palette never shows stale actions
 * from unmounted components.
 */
export function unregisterCommand(id: string): void {
  const idx = registry.findIndex((c) => c.id === id);
  if (idx >= 0) registry.splice(idx, 1);
}

/**
 * Return the live registry array. The CommandPalette calls this inside
 * `useMemo` so it always reflects the current set of registered commands
 * without needing a separate subscription mechanism.
 */
export function getCommandRegistry(): RegisteredCommand[] {
  return registry;
}
