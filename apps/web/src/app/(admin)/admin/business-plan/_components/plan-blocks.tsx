import { AlertTriangle, Info, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalloutTone, PlanBlock } from '@/content/business-plan';

const CALLOUT: Record<
  CalloutTone,
  { wrap: string; icon: typeof Info }
> = {
  amber: {
    wrap: 'border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-100',
    icon: AlertTriangle,
  },
  red: {
    wrap: 'border-red-500/25 bg-red-500/10 text-red-950 dark:text-red-100',
    icon: AlertTriangle,
  },
  lime: {
    wrap: 'border-brand-lime/30 bg-brand-lime/10 text-brand-navy dark:text-brand-lime',
    icon: Leaf,
  },
  muted: {
    wrap: 'border-border bg-muted/50 text-foreground',
    icon: Info,
  },
};

export function PlanBlocks({ blocks }: { blocks: PlanBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <PlanBlockView key={index} block={block} />
      ))}
    </div>
  );
}

function PlanBlockView({ block }: { block: PlanBlock }) {
  switch (block.type) {
    case 'prose':
      return (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {block.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
      );
    case 'callout': {
      const tone = CALLOUT[block.tone];
      const Icon = tone.icon;
      return (
        <div
          className={cn(
            'flex gap-3 rounded-xl border px-4 py-3 text-sm',
            tone.wrap,
          )}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">{block.title}</p>
            <p className="mt-1 leading-relaxed opacity-90">{block.body}</p>
          </div>
        </div>
      );
    }
    case 'table':
      return (
        <div>
          {block.caption ? (
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
              {block.caption}
            </p>
          ) : null}
          <div className="overflow-x-auto rounded-xl border border-border print:break-inside-avoid">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {block.columns.map((column) => (
                    <th
                      key={column}
                      className="px-3 py-2.5 text-left font-medium text-muted-foreground"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {block.rows.map((row, rowIndex) => (
                  <tr
                    key={row.cells.join('|')}
                    className={cn(
                      row.tone === 'danger' && 'bg-red-500/5',
                      row.tone === 'ok' && 'bg-brand-lime/5',
                      !row.tone && rowIndex % 2 === 1 && 'bg-muted/20',
                    )}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        className={cn(
                          'px-3 py-2.5',
                          cellIndex === 0
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground',
                          row.tone === 'danger' && 'text-red-700 dark:text-red-300',
                          row.tone === 'ok' &&
                            'text-brand-navy dark:text-brand-lime',
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className="space-y-4">
          {block.items.map((item, index) => (
            <li key={item.title} className="flex gap-3 text-sm">
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  block.ordered
                    ? 'bg-brand-lime/15 text-brand-navy dark:text-brand-lime'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {block.ordered ? index + 1 : '•'}
              </span>
              <span>
                <span className="font-medium text-foreground">{item.title}</span>
                <span className="mt-1 block leading-relaxed text-muted-foreground">
                  {item.body}
                </span>
              </span>
            </li>
          ))}
        </ListTag>
      );
    }
    case 'kvs':
      return (
        <dl className="grid gap-3 sm:grid-cols-2">
          {block.items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}
