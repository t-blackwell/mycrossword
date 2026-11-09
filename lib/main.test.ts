import type {
  CellChange,
  CellFocus,
  CellPosition,
  Char,
  Direction,
  GuessGrid,
  MyCrosswordProps,
  Theme,
} from 'mycrossword';

// type-level checks of the public API (verified by `npm run typecheck`)

test('the prop types are exported', () => {
  expectTypeOf<NonNullable<MyCrosswordProps['onCellChange']>>()
    .parameter(0)
    .toEqualTypeOf<CellChange>();
  expectTypeOf<NonNullable<MyCrosswordProps['onCellFocus']>>()
    .parameter(0)
    .toEqualTypeOf<CellFocus>();
  expectTypeOf<MyCrosswordProps['loadGrid']>().toEqualTypeOf<
    GuessGrid | undefined
  >();
  expectTypeOf<MyCrosswordProps['theme']>().toEqualTypeOf<Theme | undefined>();
  expectTypeOf<CellChange['pos']>().toEqualTypeOf<CellPosition>();
  expectTypeOf<CellChange['guess']>().toEqualTypeOf<Char | undefined>();
  expectTypeOf<'across'>().toExtend<Direction>();
});

test('saveGrid is only passed a guess grid', () => {
  expectTypeOf<NonNullable<MyCrosswordProps['saveGrid']>>()
    .parameter(0)
    .toEqualTypeOf<GuessGrid>();

  // a function only accepting a guess grid can be used...
  expectTypeOf<(value: GuessGrid) => void>().toExtend<
    MyCrosswordProps['saveGrid']
  >();

  // ...as can existing functions written for the previous, wider type
  expectTypeOf<
    (value: GuessGrid | ((val: GuessGrid) => GuessGrid)) => void
  >().toExtend<MyCrosswordProps['saveGrid']>();
});
