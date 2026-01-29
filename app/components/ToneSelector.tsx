"use client";

import { Tone } from "@/types/goal";

type ToneSelectorProps = {
  selectedTone: Tone;
  onToneChange: (tone: Tone) => void;
  disabled?: boolean;
};

const toneOptions: { value: Tone; label: string }[] = [
  { value: "encouraging", label: "Encouraging" },
  { value: "professional", label: "Professional" },
  { value: "brief", label: "Brief" },
];

export function ToneSelector({
  selectedTone,
  onToneChange,
  disabled = false,
}: ToneSelectorProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-stone">Tone:</span>
      {toneOptions.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onToneChange(value)}
          disabled={disabled}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedTone === value
              ? "bg-stone-dark text-white"
              : "bg-cream-dark text-stone-dark hover:bg-stone-light border border-stone-light"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
