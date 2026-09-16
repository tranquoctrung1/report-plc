export default function LogoIcon({ size = 32 }) {
  return (
    <svg className="brand-icon" width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#0e1117" />
      <path
        d="M6 22V13M13 22V8M20 22V15M27 22V10"
        stroke="#4f8cff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="13" cy="8" r="1.6" fill="#2fbf71" />
    </svg>
  );
}
