import { Cell, Clue, GuardianClue } from 'interfaces';

function getGroupCells(groupIds: string[], cells: Cell[]) {
  const groupCells: Cell[] = [];

  // get cells for each clueId in group array
  groupIds.forEach((groupId) => {
    const cellsForGroup = cells.filter((cell) =>
      cell.clueIds.includes(groupId),
    );
    groupCells.push(...cellsForGroup);
  });

  return groupCells;
}

export function isCluePopulated(clue: Clue, cells: Cell[]) {
  const groupCells = getGroupCells(clue.group, cells);
  const populatedCells = groupCells.filter((cell) => cell.guess !== undefined);

  return groupCells.length > 0 && groupCells.length === populatedCells.length;
}

export function getCrossingClueIds(clue: Clue, cells: Cell[]) {
  const clueIds: string[] = [];
  const groupCells = getGroupCells(clue.group, cells);

  groupCells.forEach((cell) => {
    clueIds.push(...cell.clueIds);
  });

  // remove duplicates
  return Array.from(new Set(clueIds));
}

export function initialiseClues(
  entries: GuardianClue[],
  cells: Cell[],
  selectedClueId?: string,
) {
  return entries.map((entry) => ({
    ...entry,
    answered: isCluePopulated(
      { ...entry, selected: false, answered: false }, // TODO: use Partial<Clue>?
      cells,
    ),
    selected: `#${entry.id}` === selectedClueId,
  }));
}
