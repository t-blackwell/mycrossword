import * as React from 'react';
import { getBem } from '~/utils/bem';
import './GridInput.css';

interface GridInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  visible: boolean;
}

const GridInput = React.forwardRef<HTMLInputElement, GridInputProps>(
  ({ onChange, onKeyDown, visible }, ref) => {
    const bem = getBem('GridInput');
    return (
      <input
        autoComplete="off"
        autoCorrect="off"
        autoFocus={false}
        className={bem(
          'GridInput',
          !visible ? 'GridInput--inclusivelyHidden' : null,
        )}
        maxLength={1}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={ref}
        spellCheck="false"
        tabIndex={-1}
        type="text"
        value=""
      />
    );
  },
);

export default GridInput;
