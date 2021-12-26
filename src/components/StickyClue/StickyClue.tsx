import * as React from 'react';
import { sanitizeHtml } from './../../utils/general';

interface StickyClueProps {
  num: string;
  onMoveNext: () => void;
  onMovePrev: () => void;
  text: string;
}

export default function StickyClue({
  num,
  onMoveNext,
  onMovePrev,
  text,
}: StickyClueProps): JSX.Element {
  return (
    <div className="StickyClue">
      <button className="StickyClue__button" onClick={onMovePrev} type="button">
        &lt;
      </button>
      <div className="StickyClue__inner">
        <span className="StickyClue__text">
          <span className="StickyClue__num">{num}</span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
        </span>
      </div>
      <button className="StickyClue__button" onClick={onMoveNext} type="button">
        &gt;
      </button>
    </div>
  );
}
