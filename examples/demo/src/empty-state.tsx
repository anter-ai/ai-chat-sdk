import { ChatEmptyState, type StarterCard } from "@anter/ai-chat-sdk";

function CardIcon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const starterCards: StarterCard[] = [
  {
    icon: <CardIcon path="M6 4h9l3 3v13H6V4zM9 12h6M9 16h4" />,
    iconColor: "#4f46e5",
    title: "Summarize a note",
    description: "A short summary with the notes it came from.",
    prompt: "Summarize a note and cite the sources",
  },
  {
    icon: <CardIcon path="M8 6h12M8 12h12M8 18h8M4 6h.01M4 12h.01M4 18h.01" />,
    iconColor: "#0f766e",
    title: "Draft an outline",
    description: "A markdown outline you can open beside the chat.",
    prompt: "Draft an outline",
  },
  {
    icon: <CardIcon path="M12 4v16M5 8l7-4 7 4M5 16l7 4 7-4" />,
    iconColor: "#b45309",
    title: "Explain a tradeoff",
    description: "A plain answer with no extra panels.",
    prompt: "Explain a tradeoff",
  },
];

export function DemoEmptyState() {
  return (
    <ChatEmptyState
      heading="What would you like to work on?"
      subheading="Ask a question, or start from one of these."
      starterCards={starterCards}
    />
  );
}
