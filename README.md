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
- Accessible to keyboard and screen reader users (see [Accessibility](#accessibility))
- Displays attempted clues as greyed out
- Autosaves progress to local storage
- Smart clearing only removes cells not part of other completed solutions
- Check and reveal solution functions (provided `solutionsAvailable: true` )
- Anagram helper

## Accessibility

The grid is drawn as an SVG, so it is presented to assistive technologies through a single labelled text input ("Crossword grid") rather than through the SVG itself:

- As the selected cell changes, a polite live region announces the clue (when it changes), the position in the answer and the cell's contents, e.g. "1 across: Toy on a string (2-2). Letter 1 of 4, blank.", then "Letter 2 of 4, Y." Checked letters are announced as correct or incorrect.
- The grid can be reached with the Tab key. If no clue is selected, the first clue is selected.
- In the grid, Tab and Shift+Tab move between clues, so Escape leaves the grid, moving focus to the selected clue in the clue list. Pressing Enter on a clue returns to the grid.
- Clues are buttons in lists labelled "Across" and "Down". The selected clue is marked as current and answered clues are announced as answered.
- The Check, Reveal and Clear menus are disclosure buttons and close with Escape. Confirmations take focus and return it to their menu button when closed.

## Install

```sh
npm install mycrossword
```

## Usage

```js
import { MyCrossword } from 'mycrossword';

const data = {
  /* ... crossword data (see below) ... */
};

export default function MyPage() {
  return <MyCrossword id="crossword-1" data={data} />;
}
```

## Styles

The styles are built in, so there's no need to import a CSS file. The stylesheet is added to the document's `<head>` when a crossword is first rendered (in the browser) and is inserted before any existing styles so that your own styles can override it.

A standalone stylesheet is still published as `mycrossword/style.css`. You don't need it, but you may want to import it if:

- you render on the server and want the styles in the initial HTML to avoid a flash of unstyled content before hydration
- your Content Security Policy doesn't allow inline `<style>` elements

```js
import 'mycrossword/style.css';
```

Existing code that already imports `mycrossword/style.css` will continue to work.

## Props

| Property                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowedHtmlTags`       | `string[]` = ['b', 'strong', 'i', 'em', 'sub', 'sup']<br />Optional list of HTML tags allowed within the clues. Use `[]` to prevent all HTML tags. Defaults to `['b', 'strong', 'i', 'em', 'sub', 'sup']`.                                                                                                                                                                                                                                                                                           |
| `allowMissingSolutions` | `boolean` = false<br />Optional flag to relax grid validation. This will allow the `data` prop to have missing or incomplete solutions in its entries.                                                                                                                                                                                                                                                                                                                                               |
| `cellMatcher`           | `RegExp` = '/[A-Z]/'<br />Optional regular expression to match against entered cell characters. Defaults to `/[A-Z]/`.                                                                                                                                                                                                                                                                                                                                                                               |
| `cellSize`              | `number` = 31<br />Optional size of each cell in the grid. Defaults to `31`.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `className`             | `string`<br />Optional string to apply a space-delimited list of class names.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `data`                  | `GuardianCrossword`<br />Required object that contains crossword clues, solutions and other information needed to draw the grid. See [crossword data](#crossword-data) below for more information.                                                                                                                                                                                                                                                                                                   |
| `id`                    | `string`<br />Required string to uniquely identify the crossword.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `intro`                 | `{ node: React.ReactNode; countdown?: { seconds: number; label?: string }; continueLabel?: string }`<br />Optional configuration for an introductory screen shown before the crossword.<br />- `node`: Content to display in the intro.<br />- `countdown.seconds`: Number of seconds before the continue button is enabled.<br />- `countdown.label`: Label for the countdown (defaults to "Skip in").<br />- `continueLabel`: Label for the continue button (defaults to "Continue to crossword"). |
| `loadGrid`              | `GuessGrid \| undefined`<br />Optional object to override storage mechanism. Called when the component is initialized with the ID of the crossword. Should return an array-based representation of the crossword grid. See [guess grid](#guess-grid) below for more information.                                                                                                                                                                                                                     |
| `onCellChange`          | `(cellChange: CellChange) => void \| undefined`<br />Optional function. Called after a grid cell has changed its guess. The object contains the properties `pos`, `guess` and `previousGuess`.                                                                                                                                                                                                                                                                                                       |
| `onCellFocus`           | `(cellFocus: CellFocus) => void \| undefined`<br />Optional function. Called after the focus switches to a new cell. The object returned contains the properties `pos` and `clueId`.                                                                                                                                                                                                                                                                                                                 |
| `onComplete`            | `() => void \| undefined`<br />Optional function. Called once after the grid has been successfully filled.                                                                                                                                                                                                                                                                                                                                                                                           |
| `saveGrid`              | `(value: GuessGrid \| ((val: GuessGrid) => GuessGrid)) => void \| undefined`<br />Optional function to override storage mechanism. Called after the grid has changed with the ID of the crossword and array-based representation of the grid. See [guess grid](#guess-grid) below for more information.                                                                                                                                                                                              |
| `stickyClue`            | `'always' \| 'never' \| 'auto'` = 'auto'<br />Optional value to define when to show the sticky clue above the grid. Defaults to `'auto'` (shown on `xs` and `sm` breakpoints).                                                                                                                                                                                                                                                                                                                       |
| `theme`                 | `'red' \| 'pink' \| 'purple' \| 'deepPurple' \| 'indigo' \| 'blue' \| 'lightBlue' \| 'cyan' \| 'teal' \| 'green' \| 'deepOrange' \| 'blueGrey'` = 'blue'<br />Optional value to override the main colour applied to the highlighted cells and clues. Defaults to `'blue'`.                                                                                                                                                                                                                           |
| `urlHash`               | `boolean` = false<br />Optional flag to sync the selected clue with the URL hash, e.g. `#1-across`. When enabled, the selected clue is written to the hash (using `history.replaceState`, keeping the existing `history.state`) and a clue named in the hash is selected on load. Defaults to `false`, so the component leaves the page URL alone.                                                                                                                                                   |

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
- Full unit test coverage using Vitest (plus real-browser tests for responsive styles)
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

Use the Node.js version in [.nvmrc](./.nvmrc) (`nvm use`).

| Command                           | Description                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm i`                           | Install dependencies                                                                                                                  |
| `npx playwright install chromium` | Install the browser used by the browser tests (once)                                                                                  |
| `npm run dev`                     | Run the example application in [src](./src). It uses the library source in [lib](./lib) directly, so changes are hot reloaded         |
| `npm run dev:dist`                | Build the library and run the example application against the built package in `dist`                                                 |
| `npm test`                        | Run all tests                                                                                                                         |
| `npm run test:watch`              | Run tests in watch mode                                                                                                               |
| `npm run test:unit`               | Run the unit tests (`*.test.ts(x)`) in [jsdom](https://github.com/jsdom/jsdom)                                                        |
| `npm run test:browser`            | Run the browser tests (`*.browser.test.ts(x)`) in headless Chromium. Use these for anything jsdom can't do, such as CSS media queries |
| `npm run lint`                    | Lint with ESLint                                                                                                                      |
| `npm run typecheck`               | Type check with TypeScript                                                                                                            |
| `npm run build`                   | Package for publishing                                                                                                                |

Tests use [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com). To use an existing Chromium installation for the browser tests, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable.

## Licence

[MIT](./LICENSE), © 2021 [Tom Blackwell](https://github.com/t-blackwell)
