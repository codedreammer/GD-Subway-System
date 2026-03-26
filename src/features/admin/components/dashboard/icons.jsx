function SvgIcon({ className = "h-5 w-5", children, viewBox = "0 0 24 24" }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Circle(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
    </SvgIcon>
  );
}

export function TrendingUp(props) {
  return (
    <SvgIcon {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </SvgIcon>
  );
}

export function TrendingDown(props) {
  return (
    <SvgIcon {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </SvgIcon>
  );
}

export function ShoppingBag(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </SvgIcon>
  );
}

export function Store(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 10h18" />
      <path d="M5 10l1-4h12l1 4" />
      <path d="M6 10v8h12v-8" />
      <path d="M10 18v-4h4v4" />
    </SvgIcon>
  );
}

export function Clock3(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </SvgIcon>
  );
}

export function XCircle(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </SvgIcon>
  );
}

export function Activity(props) {
  return (
    <SvgIcon {...props}>
      <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
    </SvgIcon>
  );
}

export function CheckCircle2(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </SvgIcon>
  );
}

export function Power(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3v8" />
      <path d="M6.3 6.3a8 8 0 1 0 11.4 0" />
    </SvgIcon>
  );
}

export function Flame(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3c2 3 4 4.5 4 8a4 4 0 1 1-8 0c0-2.5 1.5-4.5 4-8Z" />
      <path d="M12 11c1 1.2 2 1.9 2 3.1a2 2 0 1 1-4 0c0-1 .7-1.9 2-3.1Z" />
    </SvgIcon>
  );
}

export function LogOut(props) {
  return (
    <SvgIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </SvgIcon>
  );
}

export function Home(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </SvgIcon>
  );
}

export function ClipboardList(props) {
  return (
    <SvgIcon {...props}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4.5h6" />
      <path d="M9 10h6M9 14h6" />
    </SvgIcon>
  );
}

export function AlertTriangle(props) {
  return (
    <SvgIcon {...props}>
      <path d="m12 4 9 16H3L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </SvgIcon>
  );
}

export function FileText(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </SvgIcon>
  );
}

export function Shield(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3 5 6v6c0 4.5 3 7 7 9 4-2 7-4.5 7-9V6l-7-3Z" />
    </SvgIcon>
  );
}
