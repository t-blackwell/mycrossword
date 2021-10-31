import classNames from 'classnames';
import { Crossword } from 'components';
import { useBreakpoint } from 'hooks';
import type {
  GuardianCrossword,
  GuessGrid,
  CellChange,
  CellFocus,
} from 'interfaces';
import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from 'redux/store';
import './MyCrossword.scss';

export interface MyCrosswordProps {
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  theme?: 'yellow' | 'pink' | 'blue' | 'green';
}

export default function MyCrossword({
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  saveGrid,
  theme = 'yellow',
}: MyCrosswordProps): JSX.Element {
  const breakpoint = useBreakpoint();

  return (
    <div
      className={classNames(
        'MyCrossword',
        `MyCrossword--${breakpoint}`,
        `MyCrossword--${theme}Theme`,
      )}
    >
      <Provider store={store}>
        <Crossword
          data={data}
          id={id}
          loadGrid={loadGrid}
          onCellChange={onCellChange}
          onCellFocus={onCellFocus}
          saveGrid={saveGrid}
        />
      </Provider>
    </div>
  );
}
