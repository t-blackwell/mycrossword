# MyCrossword Grid

Experimental repo to see how complicated it would be to replace `@guardian/react-crossword`.

## What could be better?

- Move to TypeScript
- Switch over to functional components
- Improved unit testing
- Better responsiveness
- Accessibility enhancements

## What could be added?

- `onComplete` method when crossword has been filled successfully
- reveal letter function
- way to show intro message/ad before start
- themes
- options to facilitate multiplayer (see `@zetter/multicrosser`)

Ultimately the goal is to make it backwards compatible with [MyCrossword](https://www.mycrossword.co.uk/) and [the Guardian](https://www.theguardian.com/crosswords).

## Todo list

- [x] create repo
- [x] write readme
- [x] improve performance
- [x] move backwards on backspace keypress
- [x] create dropdown button component
- [x] add check/reveal/clear all buttons
- [x] add "{verb} grid" confirmation
- [x] add separators to the grid (thick lines and hyphens to show word breaks)
- [x] add `#num-direction` to url on clue selection and highlight on load
- [x] make css selectors more specific (switch to scss?)
- [x] create theme css (`theme: 'yellow' | 'pink' | 'blue' | 'green'`) - use css variables
- [x] open dropdown upwards when no room below
- [x] tab key cycles through clues
- [x] allow to move over black cells
- [x] mark clues as answered
- [x] media queries
- [x] save grid to local storage to make guesses persist
- [ ] add props to main component: `loadGrid`, `saveGrid`, `onMove`, `onFocusClue`
- [ ] prevent check/reveal when solutions unavailable
- [ ] layout improvements
  - [ ] fixed top clue when xs
  - [ ] change button text to "Anag." when xs
  - [ ] wrap buttons
  - [ ] prevent jump from confirm cpt text "this will automatically cancel..."
- [ ] Anagram helper (!)

## Getting started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Install dependencies

```
yarn
```

### Launch app

```
yarn start
```
