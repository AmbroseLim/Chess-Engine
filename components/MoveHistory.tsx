'use client';

import React from 'react';
import { clsx } from 'clsx';

interface MoveRecord {
  moveNumber: number;
  white: string;
  black: string | null;
}

interface MoveHistoryProps {
  moves: MoveRecord[];
  className?: string;
}

export function MoveHistory({ moves, className }: MoveHistoryProps) {
  return (
    <div
      className={clsx(
        'h-64 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-4',
        className
      )}
    >
      <div className="grid grid-cols-3 gap-2 text-sm font-medium">
        {moves.length === 0 ? (
          <p className="col-span-3 py-4 text-center text-muted-foreground">
            No moves yet
          </p>
        ) : (
          moves.map((record) => (
            <React.Fragment key={record.moveNumber}>
              <div className="font-bold text-muted-foreground">{record.moveNumber}.</div>
              <div className="text-foreground">{record.white}</div>
              <div className="text-foreground">{record.black || '-'}</div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
