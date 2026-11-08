import * as React from 'react';
import { getBem } from '~/utils/bem';
import './GridInput.css';

interface GridInputProps {
  ariaDescribedBy?: string;
  ariaLabel: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  visible: boolean;
}

const GridInput = React.forwardRef<HTMLInputElement, GridInputProps>(
  (
    {
      ariaDescribedBy,
      ariaLabel,
      onBlur,
      onChange,
      onFocus,
      onKeyDown,
      visible,
    },
    ref,
  ) => {
    const bem = getBem('GridInput');
    return (
      <input
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        autoFocus={false}
        className={bem(
          'GridInput',
          !visible ? 'GridInput--inclusivelyHidden' : null,
        )}
        maxLength={1}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        ref={ref}
        spellCheck="false"
        type="text"
        value=""
      />
    );
  },
);

export default GridInput;
