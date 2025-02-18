import { getBem } from '~/utils/bem';
import './GridError.css';

interface GridErrorProps {
  message: string;
  style?: React.CSSProperties;
}

export default function GridError({ message, style }: GridErrorProps) {
  const bem = getBem('GridError');

  return (
    <div className={bem('GridError')} style={style}>
      <div role="alert">
        <h1 className={bem('GridError__title')}>Something went wrong</h1>
        <p className={bem('GridError__subTitle')}>{message}</p>
      </div>
    </div>
  );
}
