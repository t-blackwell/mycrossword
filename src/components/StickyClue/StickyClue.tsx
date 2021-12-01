import * as React from 'react';
import { sanitizeHtml } from './../../utils/general';

interface StickyClueProps {
  num: string;
  text: string;
}

export default function StickyClue({
  num,
  text,
}: StickyClueProps): JSX.Element {
  return (
    <div className="StickyClue">
      <div className="StickyClue__inner">
        <span className="StickyClue__text">
          <span className="StickyClue__num">{num}</span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
        </span>
      </div>
    </div>
  );
}
