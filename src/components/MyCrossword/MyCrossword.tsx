import classNames from 'classnames';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Crossword } from '../../components';
import { useBreakpoint } from './../../hooks';
import type {
  GuardianCrossword,
  GuessGrid,
  CellChange,
  CellFocus,
} from './../../interfaces';
import { store } from './../../redux/store';

export interface MyCrosswordProps {
  className?: string;
  data: GuardianCrossword;
  id: string;
  loadGrid?: GuessGrid;
  onCellChange?: (cellChange: CellChange) => void;
  onCellFocus?: (cellFocus: CellFocus) => void;
  saveGrid?: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  stickyClue?: 'always' | 'never' | 'auto';
  theme?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange';
}

export default function MyCrossword({
  className,
  data,
  id,
  loadGrid,
  onCellChange,
  onCellFocus,
  saveGrid,
  stickyClue = 'auto',
  theme = 'yellow',
}: MyCrosswordProps): JSX.Element {
  const breakpoint = useBreakpoint();

  return (
    <div
      className={classNames(
        'MyCrossword',
        `MyCrossword--${breakpoint}`,
        `MyCrossword--${theme}Theme`,
        className,
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
          stickyClue={stickyClue}
        />
      </Provider>
    </div>
  );
}
