import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { ChatProvider, ChatShell, registerSlashCommand } from "@anter/ai-chat-sdk";
import "@anter/ai-chat-sdk/styles.css";
import { createDemoAdapter } from "./adapter";
import { DemoEmptyState } from "./empty-state";
import { parseScene, sessionIdForScene } from "./scenes";

registerSlashCommand({
  name: "/summarize",
  description: "Summarize the current note",
  slashCommandId: "summarize",
  exampleUsage: "/summarize",
  onSelect: ({ setValue, submit }) => {
    setValue("/summarize");
    submit("/summarize");
  },
});

function DemoApp() {
  const adapter = useMemo(() => createDemoAdapter(), []);
  const initialSessionId = useMemo(() => sessionIdForScene(parseScene(window.location.search)), []);

  return (
    <ChatProvider
      adapter={adapter}
      config={{ enableFileUpload: true, defaultModel: "demo" }}
      onSlashCommand={(name, _args, ctx) => {
        if (name !== "/summarize") return false;
        ctx.appendAssistantMessage(
          "Here is a short summary: one goal, three steps, and a request for comments.",
        );
        return true;
      }}
    >
      <div style={{ height: "100vh", width: "100vw" }}>
        <ChatShell initialSessionId={initialSessionId} emptyState={<DemoEmptyState />} />
      </div>
    </ChatProvider>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <DemoApp />
    </StrictMode>,
  );
}
