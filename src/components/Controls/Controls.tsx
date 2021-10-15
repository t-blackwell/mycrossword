import { Button, Confirm, DropdownButton } from 'components';
import { Cell, CellChange, Char, Clue, GuessGrid } from 'interfaces';
import * as React from 'react';
import {
  clearGrid as cellsActionClearGrid,
  revealGrid as cellsActionRevealGrid,
  updateGrid as cellsActionUpdateGrid,
} from 'redux/cellsSlice';
import {
  answerGrid as cluesActionAnswerGrid,
  answerOne as cluesActionAnswerOne,
  unanswerGrid as cluesActionUnanswerGrid,
  unanswerOne as cluesActionUnanswerOne,
} from 'redux/cluesSlice';
import { useAppDispatch } from 'redux/hooks';
import { blankNeighbours, mergeCell } from 'utils/cell';
import { getCrossingClueIds, getGroupCells, isCluePopulated } from 'utils/clue';
import { getGuessGrid } from 'utils/guess';
import './Controls.scss';

interface ControlsProps {
  breakpoint: string;
  cells: Cell[];
  clues: Clue[];
  gridCols: number;
  gridRows: number;
  onAnagramHelperClick: () => void;
  onCellChange?: (cellChange: CellChange) => void;
  setGuessGrid: (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void;
  solutionsAvailable: boolean;
}

export default function Controls({
  breakpoint,
  cells,
  clues,
  gridCols,
  gridRows,
  onAnagramHelperClick,
  onCellChange,
  setGuessGrid,
  solutionsAvailable,
}: ControlsProps): JSX.Element {
  const dispatch = useAppDispatch();
  const selectedCell = cells.find((cell) => cell.selected);
  const selectedClue = clues.find((clue) => clue.selected);
  const [showCheckGridConfirm, setShowCheckGridConfirm] = React.useState(false);
  const [showRevealGridConfirm, setShowRevealGridConfirm] =
    React.useState(false);
  const [showClearGridConfirm, setShowClearGridConfirm] = React.useState(false);

  const updateGuessGrid = (updatedCells: Cell[]) => {
    setGuessGrid(getGuessGrid(gridCols, gridRows, updatedCells));
  };

  const updateAnsweredForCrossingClues = (clue: Clue, updatedCells: Cell[]) => {
    const clueIds = getCrossingClueIds(clue, updatedCells);
    clueIds.forEach((clueId) => {
      const crossingClue = clues.find((c) => c.id === clueId);

      if (crossingClue) {
        if (isCluePopulated(crossingClue, updatedCells)) {
          dispatch(cluesActionAnswerOne(crossingClue.group));
        } else {
          dispatch(cluesActionUnanswerOne(crossingClue.group));
        }
      }
    });
  };

  const cellChange = (cell: Cell, newGuess: Char | undefined) => {
    if (onCellChange !== undefined && cell.guess !== newGuess) {
      onCellChange({
        pos: cell.pos,
        guess: newGuess,
        previousGuess: cell.guess,
      });
    }
  };

  const checkMenu = [
    {
      disabled: selectedCell === undefined,
      onClick: () => {
        if (selectedCell === undefined) {
          return;
        }

        if (selectedCell.guess !== selectedCell.val) {
          cellChange(selectedCell, undefined);

          // merge in selectedCell with its letter cleared
          const updatedCells = mergeCell(
            { ...selectedCell, guess: undefined },
            cells,
          );

          dispatch(cellsActionUpdateGrid(updatedCells));

          // mark across and/or down clue as unanswered
          dispatch(cluesActionUnanswerOne(selectedCell.clueIds));

          // update guesses in local storage
          updateGuessGrid(updatedCells);
        }
      },
      text: 'Check letter',
    },
    {
      disabled: selectedClue === undefined,
      onClick: () => {
        if (selectedClue !== undefined) {
          // handle cell changes
          if (onCellChange !== undefined) {
            const groupCells = getGroupCells(selectedClue.group, cells);
            groupCells.forEach((cell) => {
              if (cell.guess !== undefined && cell.val !== cell.guess) {
                cellChange(cell, undefined);
              }
            });
          }

          const updatedCells = cells.map((cell) => {
            const intersection = selectedClue.group.filter((clueId) =>
              cell.clueIds.includes(clueId),
            );

            if (intersection.length > 0) {
              return {
                ...cell,
                guess: cell.guess === cell.val ? cell.val : undefined,
              };
            }

            return cell;
          });

          dispatch(cellsActionUpdateGrid(updatedCells));
          updateAnsweredForCrossingClues(selectedClue, updatedCells);

          // update guesses in local storage
          updateGuessGrid(updatedCells);
        }
      },
      text: 'Check word',
    },
    { onClick: () => setShowCheckGridConfirm(true), text: 'Check grid' },
  ];

  const revealMenu = [
    {
      disabled: selectedCell === undefined,
      onClick: () => {
        if (
          selectedCell === undefined ||
          selectedCell.guess === selectedCell.val
        ) {
          return;
        }

        cellChange(selectedCell, selectedCell.val);

        // merge in selectedCell with its letter revealed
        const updatedCells = mergeCell(
          { ...selectedCell, guess: selectedCell.val },
          cells,
        );

        dispatch(cellsActionUpdateGrid(updatedCells));

        // if all cells are populated, mark clue as answered
        selectedCell.clueIds.forEach((clueId) => {
          const clue = clues.find((c) => c.id === clueId)!;
          const populated = isCluePopulated(clue, updatedCells);

          if (populated) {
            dispatch(cluesActionAnswerOne(clue.group));
          }
        });

        // update guesses in local storage
        updateGuessGrid(updatedCells);
      },
      text: 'Reveal letter',
    },
    {
      disabled: selectedClue === undefined,
      onClick: () => {
        if (selectedClue === undefined) {
          return;
        }

        // handle cell changes
        if (onCellChange !== undefined) {
          const groupCells = getGroupCells(selectedClue.group, cells);
          groupCells.forEach((cell) => {
            if (cell.val !== cell.guess) {
              cellChange(cell, cell.val);
            }
          });
        }

        const updatedCells = cells.map((cell) => {
          const intersection = selectedClue.group.filter((clueId) =>
            cell.clueIds.includes(clueId),
          );

          if (intersection.length > 0) {
            return {
              ...cell,
              guess: cell.val,
            };
          }

          return cell;
        });

        dispatch(cellsActionUpdateGrid(updatedCells));

        updateAnsweredForCrossingClues(selectedClue, updatedCells);

        // update guesses in local storage
        updateGuessGrid(updatedCells);
      },
      text: 'Reveal word',
    },
    { onClick: () => setShowRevealGridConfirm(true), text: 'Reveal grid' },
  ];

  const clearMenu = [
    {
      disabled: selectedClue === undefined,
      onClick: () => {
        if (selectedClue !== undefined) {
          const updatedCells = cells.map((cell) => {
            const intersection = selectedClue.group.filter((clueId) =>
              cell.clueIds.includes(clueId),
            );

            if (intersection.length > 0) {
              if (cell.clueIds.length === 1) {
                // only one direction, can safely clear the cell
                return {
                  ...cell,
                  guess: undefined,
                };
              }

              // more than one direction, check if neighbouring letters are blank
              const clueId = intersection[0];
              const across = clueId.includes('across');
              if (blankNeighbours(cells, cell, across)) {
                return {
                  ...cell,
                  guess: undefined,
                };
              }
            }

            return cell;
          });

          dispatch(cellsActionUpdateGrid(updatedCells));

          // mark clue (and others in its group) as unanswered
          dispatch(cluesActionUnanswerOne(selectedClue.group));

          // update guesses in local storage
          updateGuessGrid(updatedCells);
        }
      },
      text: 'Clear word',
    },
    { onClick: () => setShowClearGridConfirm(true), text: 'Clear grid' },
  ];

  if (showCheckGridConfirm) {
    return (
      <div className="Controls">
        <Confirm
          buttonText="Confirm check grid"
          onCancel={() => setShowCheckGridConfirm(false)}
          onConfirm={() => {
            // handle cell changes
            if (onCellChange !== undefined) {
              cells.forEach((cell) => {
                if (cell.guess !== undefined && cell.val !== cell.guess) {
                  cellChange(cell, undefined);
                }
              });
            }

            const updatedCells = cells.map((cell) => ({
              ...cell,
              guess: cell.guess === cell.val ? cell.val : undefined,
            }));

            dispatch(cellsActionUpdateGrid(updatedCells));

            // check all clues to see if they need to be marked as unanswered
            clues.forEach((clue) => {
              if (isCluePopulated(clue, updatedCells)) {
                dispatch(cluesActionAnswerOne(clue.group));
              } else {
                dispatch(cluesActionUnanswerOne(clue.group));
              }
            });

            setShowCheckGridConfirm(false);

            // update guesses in local storage
            updateGuessGrid(updatedCells);
          }}
        />
      </div>
    );
  }

  if (showRevealGridConfirm) {
    return (
      <div className="Controls">
        <Confirm
          buttonText="Confirm reveal grid"
          onCancel={() => setShowRevealGridConfirm(false)}
          onConfirm={() => {
            // handle cell changes
            if (onCellChange !== undefined) {
              cells.forEach((cell) => {
                if (cell.val !== cell.guess) {
                  cellChange(cell, cell.val);
                }
              });
            }

            dispatch(cellsActionRevealGrid());
            dispatch(cluesActionAnswerGrid());
            setShowRevealGridConfirm(false);

            // update guesses in local storage
            const updatedCells = cells.map((cell) => ({
              ...cell,
              guess: cell.val,
            }));
            updateGuessGrid(updatedCells);
          }}
        />
      </div>
    );
  }

  if (showClearGridConfirm) {
    return (
      <div className="Controls">
        <Confirm
          buttonText="Confirm clear grid"
          onCancel={() => setShowClearGridConfirm(false)}
          onConfirm={() => {
            dispatch(cellsActionClearGrid());
            dispatch(cluesActionUnanswerGrid());
            setShowClearGridConfirm(false);

            // clear guesses in local storage
            updateGuessGrid([]);
          }}
        />
      </div>
    );
  }

  return (
    <div className="Controls">
      {solutionsAvailable ? (
        <>
          <DropdownButton id="check-control" menu={checkMenu} text="Check" />
          <DropdownButton id="reveal-control" menu={revealMenu} text="Reveal" />
        </>
      ) : null}
      <DropdownButton id="clear-control" menu={clearMenu} text="Clear" />
      <div className="Controls__buttonContainer">
        <Button
          disabled={selectedClue === undefined}
          id="anagram-control"
          onClick={onAnagramHelperClick}
        >
          {breakpoint === 'xs' ? 'Anag.' : 'Anagram helper'}
        </Button>
      </div>
    </div>
  );
}
