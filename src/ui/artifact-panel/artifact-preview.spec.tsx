import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ArtifactPreview } from "./artifact-preview";
import {
  registerArtifact,
  getArtifactRegistry,
  type ArtifactRenderContext,
} from "../../extensions/artifact-registry";
import type { Artifact } from "../../headless/types/artifact";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: {},
}));

const makeArtifact = (overrides: Partial<Artifact> = {}): Artifact => ({
  artifactId: "art-1",
  type: "ctx-demo",
  title: "Demo",
  content: "hello",
  exportFormats: [],
  ...overrides,
});

describe("ArtifactPreview render context", () => {
  afterEach(() => {
    getArtifactRegistry().delete("ctx-demo");
  });

  it("passes a render context with the artifact identity to a custom renderer", () => {
    let received: ArtifactRenderContext | undefined;
    registerArtifact("ctx-demo", {
      detect: () => true,
      render: (content, ctx) => {
        received = ctx;
        return <div>{content}</div>;
      },
    });

    render(<ArtifactPreview artifact={makeArtifact()} isStreaming />);

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(received?.artifactId).toBe("art-1");
    expect(received?.type).toBe("ctx-demo");
    expect(received?.isStreaming).toBe(true);
  });

  it("wires ctx.sendMessage to the onSendMessage prop", () => {
    const onSendMessage = jest.fn();
    registerArtifact("ctx-demo", {
      detect: () => true,
      render: (_content, ctx) => (
        <button type="button" onClick={() => ctx.sendMessage("revise please")}>
          revise
        </button>
      ),
    });

    render(<ArtifactPreview artifact={makeArtifact()} onSendMessage={onSendMessage} />);

    fireEvent.click(screen.getByText("revise"));
    expect(onSendMessage).toHaveBeenCalledWith("revise please");
  });

  it("does not throw when no sender is wired (no-op-safe)", () => {
    registerArtifact("ctx-demo", {
      detect: () => true,
      render: (_content, ctx) => (
        <button type="button" onClick={() => ctx.sendMessage("noop")}>
          go
        </button>
      ),
    });

    render(<ArtifactPreview artifact={makeArtifact()} />);
    expect(() => fireEvent.click(screen.getByText("go"))).not.toThrow();
  });
});
