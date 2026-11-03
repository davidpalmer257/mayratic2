export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}

export function Brand({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? "brand brand-large" : "brand"}>
      Mayratic<span className="brand-period">.</span>
    </span>
  );
}

export function Cross() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M6 18 18 6" />
    </svg>
  );
}
