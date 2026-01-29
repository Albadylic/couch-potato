type Props = {
  className?: string;
  size?: number;
};

// Static potato mascot - friendly pose
export function PotatoMascot({ className = "", size = 120 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <ellipse cx="60" cy="65" rx="35" ry="42" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2.5" />

      {/* Spots */}
      <circle cx="45" cy="50" r="3" fill="#C4A574" />
      <circle cx="72" cy="55" r="2.5" fill="#C4A574" />
      <circle cx="50" cy="85" r="2" fill="#C4A574" />
      <circle cx="68" cy="78" r="2.5" fill="#C4A574" />

      {/* Eyes */}
      <circle cx="50" cy="60" r="3" fill="#5D4E37" />
      <circle cx="70" cy="60" r="3" fill="#5D4E37" />

      {/* Blush */}
      <ellipse cx="42" cy="68" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />
      <ellipse cx="78" cy="68" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />

      {/* Smile */}
      <path d="M52 72 Q60 80 68 72" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Left arm */}
      <path d="M28 60 Q20 55 18 48" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Right arm */}
      <path d="M92 60 Q100 55 102 48" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Left leg */}
      <path d="M48 105 L48 115" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />

      {/* Right leg */}
      <path d="M72 105 L72 115" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Waving potato for coach button
export function PotatoWaving({ className = "", size = 60 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <ellipse cx="60" cy="65" rx="35" ry="42" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2.5" />

      {/* Spots */}
      <circle cx="45" cy="50" r="3" fill="#C4A574" />
      <circle cx="72" cy="55" r="2.5" fill="#C4A574" />
      <circle cx="50" cy="85" r="2" fill="#C4A574" />

      {/* Eyes - happy/winking */}
      <circle cx="50" cy="60" r="3" fill="#5D4E37" />
      <path d="M66 58 Q70 62 74 58" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Blush */}
      <ellipse cx="42" cy="68" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />
      <ellipse cx="78" cy="68" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />

      {/* Big smile */}
      <path d="M50 72 Q60 82 70 72" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Left arm down */}
      <path d="M28 65 Q22 75 20 82" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Right arm waving up - with animation class target */}
      <g className="wave-arm" style={{ transformOrigin: "92px 55px" }}>
        <path d="M92 55 Q105 35 110 25" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Hand */}
        <circle cx="110" cy="23" r="5" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2" />
      </g>

      {/* Legs */}
      <path d="M48 105 L48 115" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 105 L72 115" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Flexing potato for achievements/encouragement
export function PotatoFlexing({ className = "", size = 120 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <ellipse cx="60" cy="65" rx="35" ry="42" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2.5" />

      {/* Spots */}
      <circle cx="45" cy="50" r="3" fill="#C4A574" />
      <circle cx="72" cy="55" r="2.5" fill="#C4A574" />
      <circle cx="50" cy="85" r="2" fill="#C4A574" />

      {/* Eyes - determined */}
      <circle cx="50" cy="58" r="3" fill="#5D4E37" />
      <circle cx="70" cy="58" r="3" fill="#5D4E37" />

      {/* Eyebrows - determined */}
      <path d="M45 52 L55 54" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 52 L65 54" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="42" cy="66" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />
      <ellipse cx="78" cy="66" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />

      {/* Big open smile */}
      <path d="M50 70 Q60 82 70 70" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M52 72 Q60 78 68 72" fill="#5D4E37" />

      {/* Left arm flexing */}
      <path d="M28 58 Q15 50 18 35" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="18" cy="32" rx="6" ry="4" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2" />

      {/* Right arm flexing */}
      <path d="M92 58 Q105 50 102 35" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="102" cy="32" rx="6" ry="4" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2" />

      {/* Legs */}
      <path d="M48 105 L48 115" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 105 L72 115" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />

      {/* Energy lines */}
      <path d="M8 28 L14 32" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 22 L16 26" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" />
      <path d="M112 28 L106 32" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" />
      <path d="M110 22 L104 26" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Loading/bouncing potato
export function PotatoLoading({ className = "", size = 80 }: Props) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-bounce"
      >
        {/* Shadow */}
        <ellipse cx="60" cy="110" rx="25" ry="6" fill="#5D4E37" opacity="0.2" className="animate-pulse" />

        {/* Body */}
        <ellipse cx="60" cy="60" rx="35" ry="42" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2.5" />

        {/* Spots */}
        <circle cx="45" cy="45" r="3" fill="#C4A574" />
        <circle cx="72" cy="50" r="2.5" fill="#C4A574" />
        <circle cx="50" cy="80" r="2" fill="#C4A574" />

        {/* Eyes - closed happy */}
        <path d="M45 55 Q50 58 55 55" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M65 55 Q70 58 75 55" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Blush */}
        <ellipse cx="42" cy="62" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />
        <ellipse cx="78" cy="62" rx="5" ry="3" fill="#E8B4B4" opacity="0.6" />

        {/* Smile */}
        <path d="M52 67 Q60 77 68 67" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Arms up */}
        <path d="M28 50 Q18 40 15 30" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M92 50 Q102 40 105 30" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Feet tucked */}
        <path d="M50 100 L48 105" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M70 100 L72 105" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Running potato for active states
export function PotatoRunning({ className = "", size = 120 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Motion lines */}
      <path d="M5 50 L15 50" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M8 60 L18 60" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M5 70 L15 70" stroke="#C4A574" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Body - tilted forward */}
      <ellipse cx="65" cy="55" rx="32" ry="38" fill="#E8D5B7" stroke="#5D4E37" strokeWidth="2.5" transform="rotate(15 65 55)" />

      {/* Spots */}
      <circle cx="52" cy="42" r="3" fill="#C4A574" />
      <circle cx="78" cy="48" r="2.5" fill="#C4A574" />
      <circle cx="58" cy="75" r="2" fill="#C4A574" />

      {/* Sweat drop */}
      <path d="M85 35 Q88 30 86 25" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Eyes - focused */}
      <circle cx="58" cy="48" r="3" fill="#5D4E37" />
      <circle cx="76" cy="52" r="3" fill="#5D4E37" />

      {/* Blush */}
      <ellipse cx="50" cy="56" rx="5" ry="3" fill="#E8B4B4" opacity="0.7" />
      <ellipse cx="84" cy="60" rx="5" ry="3" fill="#E8B4B4" opacity="0.7" />

      {/* Determined smile */}
      <path d="M60 62 Q68 70 76 64" stroke="#5D4E37" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Left arm back */}
      <path d="M38 58 Q28 68 22 75" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Right arm forward */}
      <path d="M92 48 Q102 38 108 32" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Left leg forward */}
      <path d="M55 90 Q48 100 42 108" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />

      {/* Right leg back */}
      <path d="M75 88 Q85 95 92 100" stroke="#5D4E37" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
