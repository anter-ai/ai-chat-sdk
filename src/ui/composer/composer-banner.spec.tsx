import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ComposerBanner } from "./composer-banner";

describe("ComposerBanner", () => {
  it("renders the title and icon", () => {
    render(
      <ComposerBanner
        banner={{
          id: "banner-1",
          type: "info",
          title: "Press / for slash commands",
          icon: "ⓘ",
        }}
      />,
    );

    expect(screen.getByText("Press / for slash commands")).toBeInTheDocument();
    expect(screen.getByText("ⓘ")).toBeInTheDocument();
  });

  it("fires action callback", () => {
    const onClick = jest.fn();

    render(
      <ComposerBanner
        banner={{
          id: "banner-2",
          type: "announcement",
          title: "Enable notifications?",
          action: { label: "Notify", onClick },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires banner onDismiss and local onDismiss callback", () => {
    const onBannerDismiss = jest.fn();
    const onDismiss = jest.fn();

    render(
      <ComposerBanner
        banner={{
          id: "banner-3",
          type: "success",
          title: "Done",
          dismissible: true,
          onDismiss: onBannerDismiss,
        }}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss banner" }));
    expect(onBannerDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
