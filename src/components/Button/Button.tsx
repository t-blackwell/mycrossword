import classNames from 'classnames';
import * as React from 'react';
import './Button.scss';

interface ButtonProps {
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick: () => void;
  variant?: 'filled' | 'outlined';
}

export default function Button({
  ariaLabel,
  children,
  className,
  disabled,
  id,
  onClick,
  variant = 'filled',
}: ButtonProps): JSX.Element {
  return (
    <button
      aria-label={ariaLabel}
      className={classNames('Button', `Button--${variant}`, className)}
      disabled={disabled}
      id={id}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
