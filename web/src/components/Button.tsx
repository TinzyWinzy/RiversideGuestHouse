import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'md' | 'sm';

interface ButtonBase {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type LinkProps = ButtonBase & {
  href: string;
  /** Opens in a new tab with rel="noreferrer" (safe for external links). */
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

type ButtonElementProps = ButtonBase & {
  href?: never;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type ButtonProps = LinkProps | ButtonElementProps;

/**
 * CTA atom. Renders an <a> when `href` is set, otherwise a <button> that
 * defaults to `type="button"` (never accidentally submits a form).
 */
export function Button(props: ButtonProps) {
  const { variant = 'solid', size = 'md', className, children, ...rest } = props;
  const classes = cn('btn', variant !== 'solid' && `btn-${variant}`, size === 'sm' && 'btn-sm', className);

  if (typeof rest.href === 'string') {
    const { external, ...anchor } = rest as LinkProps;
    return (
      <a className={classes} {...(external ? { target: '_blank', rel: 'noreferrer' } : undefined)} {...anchor}>
        {children}
      </a>
    );
  }

  const { type = 'button', ...button } = rest as ButtonElementProps;
  return (
    <button type={type} className={classes} {...button}>
      {children}
    </button>
  );
}