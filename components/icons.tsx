type ServiceIconType =
  | "saju"
  | "mbti"
  | "chemi"
  | "compatibility"
  | "ipip"
  | "lucky"
  | "lucky-number"
  | "today-fortune"
  | "fortune"
  | "lotto"
  | "iching"
  | "tarot"
  | "ladder"
  | "message";

export function SunLogo() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="12" fill="#FDBA2D" />
      <path
        d="M32 6V14M32 50V58M6 32H14M50 32H58M13.5 13.5L19.2 19.2M44.8 44.8L50.5 50.5M50.5 13.5L44.8 19.2M19.2 44.8L13.5 50.5"
        stroke="#F6A500"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ServiceIcon({
  type,
  stroke = "#222",
}: {
  type: ServiceIconType;
  stroke?: string;
}) {
  switch (type) {
    case "saju":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="13" stroke={stroke} strokeWidth="2.5" />
          <path d="M17 24C17 20.1 20.1 17 24 17" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M31 24C31 27.9 27.9 31 24 31" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="24" r="3" fill={stroke} />
        </svg>
      );

    case "mbti":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="10" y="10" width="12" height="12" rx="3" stroke={stroke} strokeWidth="2.5" />
          <rect x="26" y="10" width="12" height="12" rx="3" stroke={stroke} strokeWidth="2.5" />
          <rect x="10" y="26" width="12" height="12" rx="3" stroke={stroke} strokeWidth="2.5" />
          <path d="M30 26H34C36.2 26 38 27.8 38 30V34C38 36.2 36.2 38 34 38H30C27.8 38 26 36.2 26 34V30C26 27.8 27.8 26 30 26Z" stroke={stroke} strokeWidth="2.5" />
        </svg>
      );

    case "chemi":
    case "compatibility":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="17" cy="24" r="6" stroke={stroke} strokeWidth="2.5" />
          <circle cx="31" cy="24" r="6" stroke={stroke} strokeWidth="2.5" />
          <path d="M21.5 24H26.5" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "ipip":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="10" stroke={stroke} strokeWidth="2.5" />
          <path d="M24 14V34M14 24H34" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case "lucky":
    case "lucky-number":
    case "lotto":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="17" cy="17" r="6" stroke={stroke} strokeWidth="2.5" />
          <circle cx="31" cy="17" r="6" stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="30" r="6" stroke={stroke} strokeWidth="2.5" />
          <path d="M17 11V23M11 17H23M31 11V23M25 17H37M24 24V36M18 30H30" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "iching":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M12 14H36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 22H20M28 22H36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 30H36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 38H20M28 38H36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "tarot":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="13" y="9" width="22" height="30" rx="4" stroke={stroke} strokeWidth="2.5" />
          <circle cx="24" cy="24" r="5" stroke={stroke} strokeWidth="2.5" />
          <path d="M24 15V17M24 31V33M15 24H17M31 24H33" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "today-fortune":
    case "fortune":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="8" stroke={stroke} strokeWidth="2.5" />
          <path d="M24 8V13M24 35V40M8 24H13M35 24H40M13.5 13.5L17 17M31 31L34.5 34.5M34.5 13.5L31 17M17 31L13.5 34.5" stroke={stroke} strokeWidth="2.3" strokeLinecap="round" />
        </svg>
      );

    case "ladder":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M16 8V40" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M32 8V40" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M16 16H32" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 24H32" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 32H32" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M13 8H19M29 8H35" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M13 40H19M29 40H35" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    // ── 오늘 나를 위한 메시지 아이콘 ──
    case "message":
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M8 12C8 9.8 9.8 8 12 8H36C38.2 8 40 9.8 40 12V28C40 30.2 38.2 32 36 32H26L18 40V32H12C9.8 32 8 30.2 8 28V12Z" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 18H32M16 24H26" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="12" stroke={stroke} strokeWidth="2.5" />
        </svg>
      );
  }
}
