import testData from '../testData/test.valid.1';
import { initialiseCells } from '../utils/cell';
import { initialiseClues } from '../utils/clue';
import { initialiseStore } from '../utils/test';
import {
  answerGrid,
  answerOne,
  select,
  unanswerGrid,
  unanswerOne,
  updateGrid,
} from './cluesSlice';
import { store } from './store';

function getState() {
  return store.getState().clues.clues;
}

test('it updates grid', () => {
  const cells = initialiseCells(
    testData.dimensions.cols,
    testData.dimensions.rows,
    testData.entries,
  );

  const clues = initialiseClues(testData.entries, cells);

  store.dispatch(updateGrid(clues));
  expect(getState()).toStrictEqual(clues);
});

test('it selects clue', () => {
  initialiseStore(store, testData);

  const clueId = '1-across';
  const clue = getState().find((stateClue) => stateClue.id === clueId);
  expect(clue).toBeDefined();
  expect(clue?.selected).toBeFalsy();

  // select clue
  store.dispatch(select(clueId));

  const selectedClue = getState().find((stateClue) => stateClue.id === clueId);
  expect(selectedClue).toBeDefined();
  expect(selectedClue?.selected).toBeTruthy();
});

test('it answers/unanswers grid', () => {
  initialiseStore(store, testData);

  // answer all clues
  store.dispatch(answerGrid());

  getState().forEach((clue) => {
    expect(clue.answered).toBeTruthy();
  });

  // unanswer all clues
  store.dispatch(unanswerGrid());

  getState().forEach((clue) => {
    expect(clue.answered).toBeFalsy();
  });
});

test('it answers clue', () => {
  initialiseStore(store, testData);

  const clueId = '1-across';
  const clue = getState().find((stateClue) => stateClue.id === clueId);
  expect(clue).toBeDefined();
  expect(clue?.group).toBeDefined();
  expect(clue?.answered).toBeFalsy();

  // answer clue
  store.dispatch(answerOne(clue?.group!));

  const answeredClue = getState().find((stateClue) => stateClue.id === clueId);
  expect(answeredClue).toBeDefined();
  expect(answeredClue?.answered).toBeTruthy();
});

test('it answers linked clue', () => {
  initialiseStore(store, testData);

  const clueId = '2-down';
  const linkedClueId = '3-down';

  const clue = getState().find((stateClue) => stateClue.id === clueId);
  expect(clue).toBeDefined();
  expect(clue?.group).toBeDefined();
  expect(clue?.group.length).toBe(2);
  expect(clue?.answered).toBeFalsy();

  // answer clues in group
  store.dispatch(answerOne(clue?.group!));

  const answeredClue = getState().find((stateClue) => stateClue.id === clueId);
  expect(answeredClue).toBeDefined();
  expect(answeredClue?.answered).toBeTruthy();

  const linkedClue = getState().find(
    (stateClue) => stateClue.id === linkedClueId,
  );
  expect(linkedClue).toBeDefined();
  expect(linkedClue?.answered).toBeTruthy();
});

test('it unanswers clue', () => {
  initialiseStore(store, testData);

  // answer all clues
  store.dispatch(answerGrid());

  const clueId = '1-across';
  const clue = getState().find((stateClue) => stateClue.id === clueId);
  expect(clue).toBeDefined();
  expect(clue?.group).toBeDefined();
  expect(clue?.answered).toBeTruthy();

  // unanswer clue
  store.dispatch(unanswerOne(clue?.group!));

  const unansweredClue = getState().find(
    (stateClue) => stateClue.id === clueId,
  );
  expect(unansweredClue).toBeDefined();
  expect(unansweredClue?.answered).toBeFalsy();
});

test('it unanswers linked clue', () => {
  initialiseStore(store, testData);

  // answer all clues
  store.dispatch(answerGrid());

  const clueId = '2-down';
  const linkedClueId = '3-down';

  const clue = getState().find((stateClue) => stateClue.id === clueId);
  expect(clue).toBeDefined();
  expect(clue?.group).toBeDefined();
  expect(clue?.answered).toBeTruthy();

  // unanswer clue
  store.dispatch(unanswerOne(clue?.group!));

  const unansweredClue = getState().find(
    (stateClue) => stateClue.id === clueId,
  );
  expect(unansweredClue).toBeDefined();
  expect(unansweredClue?.answered).toBeFalsy();

  const linkedClue = getState().find(
    (stateClue) => stateClue.id === linkedClueId,
  );
  expect(linkedClue).toBeDefined();
  expect(linkedClue?.answered).toBeFalsy();
});
