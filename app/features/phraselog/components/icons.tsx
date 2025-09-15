import React from "react";

type IconProps = {
  className?: string;
};

export function ContextUnderstandingIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="맥락 이해"
    >
      <rect x="6" y="8" width="24" height="18" rx="7" fill="#FFFFFF" stroke="#3b82f5" strokeWidth="2" />
      <rect x="28" y="20" width="14" height="14" rx="8" fill="#FFFFFF" stroke="#3b82f5" strokeWidth="2" />
      <rect x="34" y="32" width="8" height="2" rx="1" fill="#3b82f5" />
    </svg>
  );
}

export function PersonalizationIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="개인 맞춤"
    >
      <rect x="12" y="10" width="12" height="12" rx="6" fill="#FFFFFF" stroke="#6b2be3" strokeWidth="2" />
      <rect x="10" y="24" width="20" height="16" fill="#FFFFFF" stroke="#6b2be3" strokeWidth="2" />
      <rect x="32" y="14" width="10" height="10" rx="2" fill="#FFFFFF" stroke="#6b2be3" strokeWidth="2" />
    </svg>
  );
}

export function InstantLearningIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="즉시 학습"
    >
      <rect x="22" y="10" width="16" height="24" rx="8" fill="#FFFFFF" stroke="#21cc78" strokeWidth="2" />
      <rect x="18" y="22" width="6" height="8" rx="3" fill="#21cc78" />
      <rect x="38" y="22" width="6" height="8" rx="3" fill="#21cc78" />
      <rect x="16" y="8" width="4" height="4" rx="2" fill="#21cc78" />
      <rect x="42" y="6" width="3" height="3" rx="1.5" fill="#21cc78" />
    </svg>
  );
}


