import classNames from 'classnames';
import * as React from 'react';
import './DropdownButton.scss';

interface CaretDownIconProps {
  className?: string;
}

function CaretDownIcon({ className }: CaretDownIconProps): JSX.Element {
  return (
    <svg
      className={className}
      x="0"
      y="0"
      width="8px"
      height="8px"
      viewBox="0 0 292.362 292.362"
    >
      <g>
        <path d="M286.935,69.377c-3.614-3.617-7.898-5.424-12.848-5.424H18.274c-4.952,0-9.233,1.807-12.85,5.424   C1.807,72.998,0,77.279,0,82.228c0,4.948,1.807,9.229,5.424,12.847l127.907,127.907c3.621,3.617,7.902,5.428,12.85,5.428   s9.233-1.811,12.847-5.428L286.935,95.074c3.613-3.617,5.427-7.898,5.427-12.847C292.362,77.279,290.548,72.998,286.935,69.377z" />
      </g>
    </svg>
  );
}

interface DropdownButtonProps {
  className?: string;
  menu: { disabled?: boolean; onClick: () => void; text: string }[];
  text: string;
}

function DropdownButton({
  className,
  menu,
  text,
}: DropdownButtonProps): JSX.Element {
  if (menu.length < 2) {
    throw new Error('DropdownButton should have at least 2 menu items');
  }

  const ref = React.useRef<HTMLDivElement>(null);
  const [menuExpanded, setMenuExpanded] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside =
        ref.current !== null && !ref.current.contains(event.target as Node);

      if (menuExpanded && isOutside) {
        setMenuExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return function cleanup() {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuExpanded]);

  return (
    <div
      className={classNames(
        'DropdownButton',
        menuExpanded ? 'DropdownButton--expanded' : null,
        className,
      )}
      ref={ref}
    >
      <button
        className="DropdownButton__button"
        onClick={() => setMenuExpanded((val) => !val)}
        type="button"
      >
        <span>{text}</span>
        <CaretDownIcon className="DropdownButton__dropdownButtonIcon" />
      </button>
      <div className="DropdownButton__menu">
        {menu.map((item) => (
          <button
            className="DropdownButton__menuItem"
            disabled={item.disabled}
            key={item.text}
            onClick={() => {
              item.onClick();
              setMenuExpanded(false);
            }}
            type="button"
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default React.memo(DropdownButton);
