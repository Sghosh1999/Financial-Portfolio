import { api } from '../api';
import type { Item } from '../types';

function entryDateKey(e: { date: string }): string {
  const d = e.date;
  return typeof d === 'string' ? d.slice(0, 10) : String(d).slice(0, 10);
}

export async function buildPortfolioExportPayload(userEmail: string, userName?: string) {
  const items = await api.items.list();
  const assets: ReturnType<typeof mapItem>[] = [];
  const liabilities: ReturnType<typeof mapItem>[] = [];

  function mapItem(it: Item) {
    const entries = [...(it.entries || [])].sort(
      (a, b) => entryDateKey(a).localeCompare(entryDateKey(b)) || (a.id ?? 0) - (b.id ?? 0)
    );
    const latest = entries.length ? entries[entries.length - 1].amount : 0;
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      currency: it.currency || 'INR',
      current_value: latest,
      tags: (it.tags || []).map(t => t.name),
      entry_count: entries.length,
      entries: entries.map(e => ({
        date: entryDateKey(e),
        amount: e.amount,
      })),
    };
  }

  for (const it of items) {
    if (it.type === 'asset') assets.push(mapItem(it));
    else liabilities.push(mapItem(it));
  }

  assets.sort((a, b) => b.current_value - a.current_value);
  liabilities.sort((a, b) => b.current_value - a.current_value);

  const totalAssets = assets.reduce((s, a) => s + a.current_value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.current_value, 0);

  return {
    user_email: userEmail,
    user_name: userName,
    exported_at: new Date().toISOString(),
    summary: {
      asset_count: assets.length,
      liability_count: liabilities.length,
      total_assets: Math.round(totalAssets * 100) / 100,
      total_liabilities: Math.round(totalLiabilities * 100) / 100,
      net_worth: Math.round((totalAssets - totalLiabilities) * 100) / 100,
    },
    assets,
    liabilities,
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPortfolioToFile(userEmail: string, userName?: string) {
  const payload = await buildPortfolioExportPayload(userEmail, userName);
  const safe = userEmail.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadJson(`portfolio_export_${safe}_${stamp}.json`, payload);
}
