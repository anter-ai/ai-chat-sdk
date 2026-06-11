import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToolApprovalCard } from "./tool-approval-card";
import type { ToolApproval } from "../../headless/types/chat";
import "@testing-library/jest-dom";

const pendingApproval: ToolApproval = {
  approvalId: "approval_1",
  toolCallId: "call_1",
  toolName: "search_knowledge_base",
  args: { query: "multi-agent" },
  riskCategory: "read_only",
  executionId: "wexec_1",
  status: "pending",
};

describe("ToolApprovalCard", () => {
  it("renders tool name, humanized risk and actions when resolvable", () => {
    const onResolve = jest.fn();
    render(<ToolApprovalCard approval={pendingApproval} canResolve onResolve={onResolve} />);

    expect(screen.getByText("search_knowledge_base")).toBeInTheDocument();
    expect(screen.getByText("read only")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deny" })).toBeInTheDocument();
  });

  it("approves on click", async () => {
    const onResolve = jest.fn().mockResolvedValue(undefined);
    render(<ToolApprovalCard approval={pendingApproval} canResolve onResolve={onResolve} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    await waitFor(() =>
      expect(onResolve).toHaveBeenCalledWith(pendingApproval, "approved", undefined),
    );
  });

  it("denies with a reason through the confirm flow", async () => {
    const onResolve = jest.fn().mockResolvedValue(undefined);
    render(<ToolApprovalCard approval={pendingApproval} canResolve onResolve={onResolve} />);

    fireEvent.click(screen.getByRole("button", { name: "Deny" }));
    fireEvent.change(screen.getByPlaceholderText("Optional reason — sent to the agent"), {
      target: { value: "Out of scope" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm deny" }));

    await waitFor(() =>
      expect(onResolve).toHaveBeenCalledWith(pendingApproval, "denied", "Out of scope"),
    );
  });

  it("renders a passive waiting note when the adapter cannot resolve", () => {
    render(
      <ToolApprovalCard approval={pendingApproval} canResolve={false} onResolve={jest.fn()} />,
    );

    expect(screen.getByText("Waiting for approval through another channel…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  it("renders a denied card with the reason and no actions", () => {
    render(
      <ToolApprovalCard
        approval={{ ...pendingApproval, status: "denied", reason: "Not allowed" }}
        canResolve
        onResolve={jest.fn()}
      />,
    );

    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(screen.getByText("“Not allowed”")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  it("surfaces a resolution error and keeps the card actionable", () => {
    render(
      <ToolApprovalCard
        approval={{ ...pendingApproval, error: "Request failed (404)" }}
        canResolve
        onResolve={jest.fn()}
      />,
    );

    expect(screen.getByText("Request failed (404)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});
