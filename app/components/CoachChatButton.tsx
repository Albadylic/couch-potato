"use client";

import { PotatoWaving } from "./PotatoMascot";

type Props = {
  onClick: () => void;
  hasNotification?: boolean;
};

export default function CoachChatButton({ onClick, hasNotification }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-cream-dark hover:bg-stone-light rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-stone-light hover:border-stone animate-pulse-glow"
      aria-label="Chat with your potato coach"
      title="Chat with Coach Spud"
    >
      <PotatoWaving size={48} />
      {hasNotification && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-sage rounded-full border-2 border-cream flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </span>
      )}
    </button>
  );
}
