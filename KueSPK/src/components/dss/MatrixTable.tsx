import React from 'react';

interface Props {
  title: string;
  description?: string;
  firstColLabel?: string;
  columns: string[];
  rows: { key: string; label: string; cells: (string | number)[]; highlight?: boolean }[];
}

export default function MatrixTable({ title, description, firstColLabel = 'Varian', columns, rows }: Props) {
  return (
    <div className="card-warm overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h3>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)' }}>
              <th className="text-left font-semibold px-5 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                {firstColLabel}
              </th>
              {columns.map((c) => (
                <th key={c} className="text-right font-semibold px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.key}
                className="table-row-hover"
                style={{
                  borderTop: '1px solid var(--border)',
                  fontWeight: r.highlight ? 700 : 400,
                  backgroundColor: r.highlight ? 'var(--peach-100)' : undefined,
                }}
              >
                <td className="px-5 py-2.5 whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{r.label}</td>
                {r.cells.map((cell, i) => (
                  <td key={`${r.key}-${i}`} className="px-4 py-2.5 text-right font-tabular whitespace-nowrap">
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
}
