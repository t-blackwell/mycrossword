import CaretDownIcon from '~/icons/CaretDownIcon';
import classNames from 'classnames';
import * as React from 'react';
import { isInViewport } from '~/utils/general';
import { getBem } from '~/utils/bem';
import './DropdownButton.css';

export interface DropdownMenuItem {
  disabled?: boolean;
  onClick: () => void;
  text: string;
}

interface DropdownButtonProps {
  className?: string;
  id?: string;
  menu: DropdownMenuItem[];
  text: string;
}

function DropdownButton({ className, id, menu, text }: DropdownButtonProps) {
  if (menu.length < 2) {
    throw new Error('DropdownButton should have at least 2 menu items');
  }

  const bem = getBem('DropdownButton');
  const componentRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const [menuExpanded, setMenuExpanded] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside =
        componentRef.current !== null &&
        !componentRef.current.contains(event.target as Node);

      if (menuExpanded && isOutside) {
        setMenuExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return function cleanup() {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuExpanded]);

  const toggleMenuExpanded = () => {
    if (menuRef.current !== null && buttonRef.current !== null) {
      menuRef.current.style.marginTop = '';

      if (!menuExpanded) {
        // check if dropdown fits in viewport
        const menuRect = menuRef.current.getBoundingClientRect();
        const inView = isInViewport(menuRect);

        // open dropdown upwards
        if (!inView) {
          const height = menuRect.height + buttonRef.current.clientHeight + 10;
          menuRef.current.style.marginTop = `-${height}px`;
        }
      }
    }

    setMenuExpanded((val) => !val);
  };

  // close the menu with Escape, returning focus to the button
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && menuExpanded) {
      event.preventDefault();
      setMenuExpanded(false);
      buttonRef.current?.focus();
    }
  };

  // close the menu when focus moves elsewhere e.g. tabbing past the last item
  // (clicks outside are handled above; relatedTarget is null for those in
  // browsers that don't focus buttons on click, e.g. Safari)
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const isOutside =
      event.relatedTarget !== null &&
      !event.currentTarget.contains(event.relatedTarget as Node);

    if (menuExpanded && isOutside) {
      setMenuExpanded(false);
    }
  };

  return (
    <div
      className={classNames(
        bem('DropdownButton', menuExpanded ? 'DropdownButton--expanded' : null),
        className,
      )}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={componentRef}
    >
      {/* a disclosure button: the menu is a list of buttons, shown or hidden */}
      <button
        aria-controls={id !== undefined ? `${id}-menu` : undefined}
        aria-expanded={menuExpanded ? 'true' : 'false'}
        className={bem('DropdownButton__button')}
        id={id}
        onClick={toggleMenuExpanded}
        ref={buttonRef}
        type="button"
      >
        <span>{text}</span>
        <CaretDownIcon className={bem('DropdownButton__dropdownButtonIcon')} />
      </button>
      <ul
        aria-label={`${text} menu`}
        className={bem('DropdownButton__menu')}
        id={id !== undefined ? `${id}-menu` : undefined}
        ref={menuRef}
      >
        {menu.map((item) => (
          <li key={item.text}>
            <button
              className={bem('DropdownButton__menuItem')}
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setMenuExpanded(false);
              }}
              type="button"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default React.memo(DropdownButton);
