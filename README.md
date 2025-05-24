# MyCrossword

React crossword component built to work with Guardian crossword data.

![image](https://github.com/t-blackwell/mycrossword/assets/31444631/bb21604a-deee-4f15-9e66-050d972f9e63)

## Features

- Displays crossword grid and list of clues
- Displays separators in the grid for hyphenated and multi-word solutions
- Responsive to different screen sizes
- Clue selection highlights relevant cells
- Grouped clues span multiple columns or rows
- Tab key cycles between clues
- Arrow keys navigate between cells
- Displays attempted clues as greyed out
- Autosaves progress to local storage
- Smart clearing only removes cells not part of other completed solutions
- Check and reveal solution functions (provided `solutionsAvailable: true` )
- Anagram helper

## Install

```sh
npm install mycrossword
```

## Usage

```js
import MyCrossword from 'mycrossword';
import 'mycrossword/style.css';

const data = {
  /* ... crossword data (see below) ... */
};

export default function MyPage() {
  return <MyCrossword id="crossword-1" data={data} />;
}
```

## Props

| Property                | Description                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowedHtmlTags`       | `string[]` = ['b', 'strong', 'i', 'em', 'sub', 'sup']<br />Optional list of HTML tags allowed within the clues. Use `[]` to prevent all HTML tags. Defaults to `['b', 'strong', 'i', 'em', 'sub', 'sup']`.                                                                                              |
| `allowMissingSolutions` | `boolean` = false<br />Optional flag to relax grid validation. This will allow the `data` prop to have missing or incomplete solutions in its entries.                                                                                                                                                  |
| `cellMatcher`           | `RegExp` = '/[A-Z]/'<br />Optional regular expression to match against entered cell characters. Defaults to `/[A-Z]/`.                                                                                                                                                                                  |
| `cellSize`              | `number` = 31<br />Optional size of each cell in the grid. Defaults to `31`.                                                                                                                                                                                                                            |
| `className`             | `string`<br />Optional string to apply a space-delimited list of class names.                                                                                                                                                                                                                           |
| `data`                  | `GuardianCrossword`<br />Required object that contains crossword clues, solutions and other information needed to draw the grid. See [crossword data](#crossword-data) below for more information.                                                                                                      |
| `id`                    | `string`<br />Required string to uniquely identify the crossword.                                                                                                                                                                                                                                       |
| `loadGrid`              | `GuessGrid \| undefined`<br />Optional object to override storage mechanism. Called when the component is initialized with the ID of the crossword. Should return an array-based representation of the crossword grid. See [guess grid](#guess-grid) below for more information.                        |
| `onCellChange`          | `(cellChange: CellChange) => void \| undefined`<br />Optional function. Called after a grid cell has changed its guess. The object contains the properties `pos`, `guess` and `previousGuess`.                                                                                                          |
| `onCellFocus`           | `(cellFocus: CellFocus) => void \| undefined`<br />Optional function. Called after the focus switches to a new cell. The object returned contains the properties `pos` and `clueId`.                                                                                                                    |
| `onComplete`            | `() => void \| undefined`<br />Optional function. Called once after the grid has been successfully filled.                                                                                                                                                                                              |
| `saveGrid`              | `(value: GuessGrid \| ((val: GuessGrid) => GuessGrid)) => void \| undefined`<br />Optional function to override storage mechanism. Called after the grid has changed with the ID of the crossword and array-based representation of the grid. See [guess grid](#guess-grid) below for more information. |
| `stickyClue`            | `'always' \| 'never' \| 'auto'` = 'auto'<br />Optional value to define when to show the sticky clue above the grid. Defaults to `'auto'` (shown on `xs` and `sm` breakpoints).                                                                                                                          |
| `theme`                 | `'red' \| 'pink' \| 'purple' \| 'deepPurple' \| 'indigo' \| 'blue' \| 'lightBlue' \| 'cyan' \| 'teal' \| 'green' \| 'deepOrange' \| 'blueGrey'` = 'blue'<br />Optional value to override the main colour applied to the highlighted cells and clues. Defaults to `'blue'`.                              |

## Crossword data

This is an example of the JSON data required to create the crossword shown above. Its structure is defined by the [GuardianCrossword](./GuardianCrossword.md) interface.

```
{
  id: 'simple/1',
  number: 1,
  name: 'Simple Crossword #1',
  date: 1542326400000,
  entries: [
    {
      id: '1-across',
      number: 1,
      humanNumber: '1',
      clue: 'Toy on a string (2-2)',
      direction: 'across',
      length: 4,
      group: ['1-across'],
      position: { x: 0, y: 0 },
      separatorLocations: {
        '-': [2],
      },
      solution: 'YOYO',
    },
    {
      id: '4-across',
      number: 4,
      humanNumber: '4',
      clue: 'Have a rest (3,4)',
      direction: 'across',
      length: 7,
      group: ['4-across'],
      position: { x: 0, y: 2 },
      separatorLocations: {
        ',': [3],
      },
      solution: 'LIEDOWN',
    },
    {
      id: '1-down',
      number: 1,
      humanNumber: '1',
      clue: 'Colour (6)',
      direction: 'down',
      length: 6,
      group: ['1-down'],
      position: { x: 0, y: 0 },
      separatorLocations: {},
      solution: 'YELLOW',
    },
    {
      id: '2-down',
      number: 2,
      humanNumber: '2',
      clue: 'Bits and bobs (4,3,4)',
      direction: 'down',
      length: 7,
      group: ['2-down', '3-down'],
      position: { x: 3, y: 0 },
      separatorLocations: {
        ',': [4, 7],
      },
      solution: 'ODDSAND',
    },
    {
      id: '3-down',
      number: 3,
      humanNumber: '3',
      clue: 'See 2',
      direction: 'down',
      length: 4,
      group: ['2-down', '3-down'],
      position: {
        x: 6,
        y: 1,
      },
      separatorLocations: {},
      solution: 'ENDS',
    },
  ],
  solutionAvailable: true,
  dateSolutionAvailable: 1542326400000,
  dimensions: {
    cols: 13,
    rows: 13,
  },
  crosswordType: 'quick',
};
```

## Guess grid

Some functions require or return the state of the crossword grid. This is a 2-dimensional array holding the user's guess for each cell. Incomplete cells or cells that are not part of any answer are represented as the empty string (`""`). Note that it follows the convention of indexing by column first (x) and then row (y) so the printed array is transposed compared to how the crossword grid appears. For example, the following crossword...

<table>
  <tr>
    <td>■</td>
    <td>D</td>
    <td>■</td>
  </tr>
  <tr>
    <td>■</td>
    <td>O</td>
    <td>■</td>
  </tr>
  <tr>
    <td>A</td>
    <td>G</td>
    <td>E</td>
  </tr>
</table>

...would be represented as...

```JSON
{
  "value": [
    ["",  "",  "A"],
    ["D", "O", "G"],
    ["",  "",  "E"]
  ]
}
```

## What's new?

While the project has been created from scratch, it should be considered as a continuation of [@guardian](https://github.com/guardian)/[react-crossword](https://github.com/guardian/react-crossword). With that in mind, here's a list of improvements when compared to the original:

### Technical improvements

- Use of TypeScript
- Built with Vite
- Switched to functional components
- Better performance (memoization, useCallback etc.)
- Simplified global state management using Zustand
- More modular component hierarchy
- Scoped CSS
- Full unit test coverage
- CI using GitHub actions

### Functional improvements

- Theme styles
- Combined buttons to use dropdown menus
- Check/Reveal letter
- Arrow keys can skip over dark cells
- Backspace key moves backwards without the cell having to be empty
- Anagram helper
  - Click clue words to add to anagram
  - Added letter to centre of word wheel
  - Character counter
  - Escape key to clear/close
  - Show missing letters from grid
- Removed hidden input and implicitly fixed the window resize bug
- Fixed HTML display in StickyClue and AnagramHelper
- Better loading and error state display

## Working with this project

`npm i` to install dependencies

`npm run test` to run unit tests

`npm run build` to package for publishing

`npm run dev` to run the example application

## Licence

[MIT](./LICENSE), © 2021 [Tom Blackwell](https://github.com/t-blackwell)
