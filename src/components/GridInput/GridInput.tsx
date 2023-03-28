import classNames from 'classnames';
import * as React from 'react';

interface GridInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  visible: boolean;
}

const GridInput = React.forwardRef<HTMLInputElement, GridInputProps>(
  ({ onChange, onKeyDown, visible }, ref) => {
    return (
      <input
        autoComplete="off"
        autoCorrect="off"
        autoFocus={false}
        className={classNames(
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
