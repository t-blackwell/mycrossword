import { getBem } from '~/utils/bem';
import './Spinner.css';

interface SpinnerProps {
  size: 'small' | 'standard' | 'large';
}

export default function Spinner({ size }: SpinnerProps) {
  const bem = getBem('Spinner');

  return <div className={bem('Spinner', `Spinner--${size}`)} role="status" />;
}
