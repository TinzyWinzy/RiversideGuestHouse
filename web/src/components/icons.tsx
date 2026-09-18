import type { ReactNode } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
}

type Icon = (props: IconProps) => ReactNode;

function StrokeIcon({ size = 20, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const SunIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </StrokeIcon>
);

export const DropletIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </StrokeIcon>
);

export const LockIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </StrokeIcon>
);

export const BedIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </StrokeIcon>
);

export const FlameIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </StrokeIcon>
);

export const WifiIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M12 20h.01" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.859a10 10 0 0 1 14 0" />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
  </StrokeIcon>
);

export const BriefcaseIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </StrokeIcon>
);

export const UsersIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </StrokeIcon>
);

export const CarIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </StrokeIcon>
);

export const UserPlusIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </StrokeIcon>
);

export const MessageIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </StrokeIcon>
);

export const MenuIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </StrokeIcon>
);

export const CloseIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </StrokeIcon>
);

export const CheckIcon: Icon = (props) => (
  <StrokeIcon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </StrokeIcon>
);

/* Official WhatsApp glyph (fill-based brand mark). */
export const WhatsAppIcon: Icon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.8c1.8 1 3.9 1.6 6.1 1.6h.2c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.5 1.1 1.1-4.4-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6 0-5.4 4.4-9.8 9.9-9.8s9.9 4.4 9.9 9.8-4.5 9.9-9.7 9.9zm5.4-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.2-.2.2-.7.9-.9 1.2-.2.3-.3.3-.6.2-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.4.1-.6l.6-.7c.2-.2.2-.4.4-.6.1-.2 0-.4 0-.6L9.7 9c-.3-.6-.5-.5-.7-.6h-.6c-.2 0-.6.2-.9.6-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.4c.2.2 2.3 3.5 5.5 4.9 3.7 1.6 3.7 1.1 4.4 1 .7-.1 2.1-.9 2.4-1.7.3-.9.3-1.6.2-1.7-.1-.2-.3-.2-.6-.4z" />
  </svg>
);