import classNames from 'classnames';
import * as React from 'react';

interface ButtonProps {
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  variant?: 'filled' | 'outlined';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      ariaLabel,
      children,
      className,
      disabled,
      id,
      onClick,
      onKeyDown,
      variant = 'filled',
    },
    ref,
  ) => (
    <button
      aria-label={ariaLabel}
      className={classNames('Button', `Button--${variant}`, className)}
      disabled={disabled}
      id={id}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  ),
);

export default Button;
