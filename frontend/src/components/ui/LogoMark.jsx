export default function LogoMark({ size = 52 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M20 15 L35 85 L50 40 L65 85 L80 15"
        stroke="#1f1f1f"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M28 25 C18 40, 18 60, 28 78"
        stroke="#1f1f1f"
        strokeWidth="3"
      />
      <path
        d="M25 35 C18 32, 18 42, 25 40"
        stroke="#1f1f1f"
        strokeWidth="2"
      />
      <path
        d="M25 50 C18 47, 18 57, 25 55"
        stroke="#1f1f1f"
        strokeWidth="2"
      />
      <path
        d="M25 65 C18 62, 18 72, 25 70"
        stroke="#1f1f1f"
        strokeWidth="2"
      />
    </svg>
  );
}
