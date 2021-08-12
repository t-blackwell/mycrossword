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
- [ ] make css selectors more specific (switch to scss?)
- [ ] add check/reveal/clear all buttons
- [ ] create split button component
- [ ] create theme css (`theme: 'yellow' | 'pink' | 'blue' | 'green'`)
- [ ] move backwards on backspace keypress
- [ ] add `#num-direction` to url on clue selection and highlight on load
- [ ] save grid to local storage to make guesses persist
- [ ] allow to move over black cells
- [ ] mark clues as answered
- [ ] add separators to the grid (thick lines and hyphens to show word breaks)
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
