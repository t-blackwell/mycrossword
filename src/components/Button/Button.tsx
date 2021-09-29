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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      ariaLabel,
      children,
      className,
      disabled,
      id,
      onClick,
      variant = 'filled',
    },
    ref,
  ): JSX.Element => (
    <button
      aria-label={ariaLabel}
      className={classNames('Button', `Button--${variant}`, className)}
      disabled={disabled}
      id={id}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  ),
);

export default Button;
