'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { bulkImportLevels } from '@/lib/actions/levels';

type ParsedRow = {
  level_number: number;
  youtube_url: string;
  title: string;
  walkthrough: string;
  tips: string;
  description: string;
};

type ImportResult =
  | { success: true; inserted: number; skipped: number; invalid: number }
  | { error: string };

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current || row.length) {
        row.push(current);
        rows.push(row);
        row = [];
        current = '';
      }
      if (ch === '\r' && next === '\n') i++;
    } else {
      current += ch;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function parseLevels(rows: string[][]): { levels: ParsedRow[]; errors: string[] } {
  if (rows.length < 2) {
    return { levels: [], errors: ['CSV must have a header row and at least one data row.'] };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idxLevel = header.indexOf('level_number');
  const idxUrl = header.indexOf('youtube_url');
  const idxTitle = header.indexOf('title');
  const idxWalkthrough = header.indexOf('walkthrough');
  const idxTips = header.indexOf('tips');
  const idxDescription = header.indexOf('description');

  const errors: string[] = [];

  if (idxLevel === -1) errors.push('Missing column: level_number');
  if (idxUrl === -1) errors.push('Missing column: youtube_url');

  if (errors.length > 0) {
    return { levels: [], errors };
  }

  const levels: ParsedRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const levelNumber = parseInt((row[idxLevel] || '').trim(), 10);
    const youtubeUrl = (row[idxUrl] || '').trim();
    const title = idxTitle >= 0 ? (row[idxTitle] || '').trim() : '';
    const walkthrough = idxWalkthrough >= 0 ? (row[idxWalkthrough] || '').trim() : '';
    const tips = idxTips >= 0 ? (row[idxTips] || '').trim() : '';
    const description = idxDescription >= 0 ? (row[idxDescription] || '').trim() : '';

    if (!levelNumber || !youtubeUrl) continue;

    levels.push({
      level_number: levelNumber,
      youtube_url: youtubeUrl,
      title: title || `Level ${levelNumber}`,
      walkthrough,
      tips,
      description,
    });
  }

  return { levels, errors };
}

export default function BulkImportForm({ gameId }: { gameId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [levels, setLevels] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  // ✅ useTransition — async action calls ke liye
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setErrors([]);
    setResult(null);
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Please upload a .csv file.']);
      setLevels([]);
      return;
    }

    const text = await file.text();
    const rows = parseCSV(text);
    const { levels: parsed, errors: parseErrors } = parseLevels(rows);

    setErrors(parseErrors);
    setLevels(parsed);
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setLevels([]);
    setFileName('');
    setErrors([]);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // ✅ Import handler — startTransition ke andar
  function handleImport() {
    if (levels.length === 0) return;
    setResult(null);

    startTransition(async () => {
      try {
        const res = await bulkImportLevels(gameId, JSON.stringify(levels));
        setResult(res);
        if ('success' in res) {
          reset();
          router.refresh();
        }
      } catch {
        setResult({ error: 'Import failed. Please try again.' });
      }
    });
  }

  function downloadTemplate() {
    const sample = `level_number,youtube_url,title,walkthrough,tips
1,https://www.youtube.com/watch?v=Xh5Oq_8BuOU,Sand Blocks Level 1 Walkthrough Solution,"<p>Step-by-step walkthrough coming soon.</p>","<p>Helpful tip for this level.</p>"
2,https://www.youtube.com/watch?v=ymr6pE8o54E,Sand Blocks Level 2 Walkthrough Solution,,"<p>Plan two moves ahead.</p>"
3,https://www.youtube.com/watch?v=MfotFKyX62A,Sand Blocks Level 3 Walkthrough Solution,,`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'levels-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          CSV columns: <code>level_number</code>, <code>youtube_url</code>, <code>title</code>,{' '}
          <code>walkthrough</code>, <code>tips</code>
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="btn btn-secondary btn-sm"
        >
          📥 Download Template
        </button>
      </div>

      {/* Drop zone */}
      {levels.length === 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer py-10 px-4 transition"
          style={{ borderColor: 'var(--line)', background: '#fff' }}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="font-bold mb-1" style={{ color: 'var(--ink)' }}>
            Click karo ya CSV file drag karo
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            File name: <strong>anything.csv</strong> · Max 2000 levels per upload
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onSelect}
        className="hidden"
      />

      {/* Errors */}
      {errors.length > 0 && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
        >
          <div className="font-bold mb-1">
            ⚠️ {errors.length} issue{errors.length > 1 ? 's' : ''}:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {levels.length > 0 && (
        <div className="rounded-xl border" style={{ borderColor: 'var(--line)' }}>
          <div
            className="flex items-center justify-between p-3 border-b"
            style={{ borderColor: 'var(--line-soft)', background: 'var(--bg-alt)' }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                📄 {fileName}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {levels.length} levels ready to import
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition hover:bg-white disabled:opacity-50"
              style={{ color: 'var(--muted)' }}
            >
              ✕ Change file
            </button>
          </div>

          <div className="max-h-64 overflow-auto">
            <table className="w-full text-xs">
              <thead
                className="sticky top-0"
                style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--line)' }}
              >
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">#</th>
                  <th className="text-left px-3 py-2 font-semibold">Title</th>
                  <th className="text-left px-3 py-2 font-semibold">Walkthrough</th>
                  <th className="text-left px-3 py-2 font-semibold">Tips</th>
                </tr>
              </thead>
              <tbody>
                {levels.slice(0, 50).map((lv, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td className="px-3 py-1.5 font-bold" style={{ color: 'var(--primary-dark)' }}>
                      {lv.level_number}
                    </td>
                    <td className="px-3 py-1.5 truncate" style={{ maxWidth: 220 }}>
                      {lv.title}
                    </td>
                    <td className="px-3 py-1.5 truncate" style={{ maxWidth: 180 }}>
                      {lv.walkthrough ? (
                        <span className="text-green-700 font-semibold">
                          ✓ {lv.walkthrough.length} chars
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted-light)' }}>—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 truncate" style={{ maxWidth: 140 }}>
                      {lv.tips ? (
                        <span className="text-green-700 font-semibold">
                          ✓ {lv.tips.length} chars
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted-light)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {levels.length > 50 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-2 text-center text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      … and {levels.length - 50} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="p-3 flex justify-end"
            style={{ borderTop: '1px solid var(--line-soft)' }}
          >
            <button
              type="button"
              onClick={handleImport}
              disabled={isPending}
              className="btn btn-primary btn-sm"
            >
              {isPending ? 'Importing…' : `⚡ Import ${levels.length} levels`}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className="rounded-xl p-4 text-sm"
          style={
            'success' in result
              ? { background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }
              : { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
          }
        >
          {'success' in result ? (
            <>
              <div className="font-bold mb-1">✅ Import complete!</div>
              <ul className="text-xs space-y-0.5 mt-1">
                <li>
                  • Inserted: <strong>{result.inserted}</strong>
                </li>
                {result.skipped > 0 && <li>• Skipped (already exist): {result.skipped}</li>}
                {result.invalid > 0 && <li>• Invalid rows: {result.invalid}</li>}
              </ul>
            </>
          ) : (
            <>
              <div className="font-bold mb-1">❌ Import failed</div>
              <div>{result.error}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
