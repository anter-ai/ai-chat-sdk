import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatShellHeader } from "./chat-shell-header";

describe("ChatShellHeader", () => {
  it("renders sessionTitle and menu button", () => {
    const onOpenMenu = jest.fn();
    render(<ChatShellHeader sessionTitle="Project discussion" onOpenMenu={onOpenMenu} />);

    expect(screen.getByText("Project discussion")).toBeInTheDocument();
    const menuBtn = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menuBtn);
    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });

  it("renders artifacts button when artifactsCount > 0 and enableArtifacts is true", () => {
    const onToggleArtifacts = jest.fn();
    render(
      <ChatShellHeader
        sessionTitle="Test"
        onOpenMenu={jest.fn()}
        artifactsCount={2}
        onToggleArtifacts={onToggleArtifacts}
        enableArtifacts={true}
      />,
    );

    const btn = screen.getByRole("button", { name: "Open artifacts panel" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onToggleArtifacts).toHaveBeenCalledTimes(1);
  });

  it("unmounts artifacts button when enableArtifacts is false", () => {
    render(
      <ChatShellHeader
        sessionTitle="Test"
        onOpenMenu={jest.fn()}
        artifactsCount={2}
        onToggleArtifacts={jest.fn()}
        enableArtifacts={false}
      />,
    );

    expect(screen.queryByRole("button", { name: /artifacts panel/i })).not.toBeInTheDocument();
  });
});
