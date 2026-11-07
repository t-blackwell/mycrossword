import classNames from 'classnames';

type Element = `__${Uncapitalize<string>}`;
type Modifier = `--${Uncapitalize<string>}`;

/**
 * This function returns another function that just wraps the classNames
 * function, but adds typesafety to ensure (as far as possible) that the classes
 * follow the BEM convention, with respect to the given block.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used for its type
export function getBem<Block extends Capitalize<string>>(_block: Block) {
  return (
    ...args: Array<
      | Block
      | `${Block}${Element}`
      | `${Block}${Modifier}`
      | `${Block}${Element}${Modifier}`
      | null
      | undefined
    >
  ) => classNames(args);
}
