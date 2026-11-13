'use client';

import React, { useEffect, useState } from 'react';

export default function NetworkManager() {
  const [networks, setNetworks] = useState<Array<{ name: string; size: number; mtime: number }>>([]);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoInit, setAutoInit] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem('lc0_auto_init_best') === '1';
    } catch {
      return false;
    }
  });

  async function fetchList() {
    try {
      const resp = await fetch('/api/lc0/list');
      const json = await resp.json();
      setNetworks(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    // If autoInit is enabled, and we already fetched networks, init the best network
    if (!autoInit) return;
    if (networks.length === 0) return;

    const best = pickBestNetwork(networks);
    if (best) {
      // Delay slightly to ensure UI is ready
      setTimeout(() => initNetwork(best.name), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoInit, networks]);

  function pickBestNetwork(list: Array<{ name: string; size: number; mtime: number }>) {
    if (!list || list.length === 0) return null;
    // Prefer largest size, tie-break with newest modification time
    return list
      .slice()
      .sort((a, b) => {
        if (b.size !== a.size) return b.size - a.size;
        return b.mtime - a.mtime;
      })[0];
  }

  async function downloadFromUrl() {
    if (!url) return;
    setLoading(true);
    try {
      await fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'downloadNetwork', url }),
      });
      await fetchList();
      setUrl('');
    } catch (error) {
      console.error(error);
      alert('Download failed');
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile() {
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await fetch('/api/lc0/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, contentBase64: base64 }),
      });

      setFile(null);
      await fetchList();
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  }

  async function initNetwork(name: string) {
    setLoading(true);
    try {
      const resp = await fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', networkName: name }),
      });
      const json = await resp.json();
      alert(json?.message || 'Initialized');
    } catch (error) {
      console.error(error);
      alert('Init failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/10 p-3 text-sm">
      <div className="font-semibold">Network Manager</div>

      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-foreground"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Network URL"
        />
        <button
          onClick={downloadFromUrl}
          disabled={!url || loading}
          className="rounded-md bg-primary px-3 py-1 text-primary-foreground disabled:opacity-50"
        >
          Download
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          onChange={(event) => setFile(event.target.files ? event.target.files[0] : null)}
          className="min-w-0 flex-1 text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-foreground"
        />
        <button
          onClick={uploadFile}
          disabled={!file || loading}
          className="rounded-md border border-border px-3 py-1 disabled:opacity-50"
        >
          Upload
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Auto-init best network on load</div>
        <div className="flex items-center gap-2">
          <label className="text-sm">
            <input
              type="checkbox"
              checked={autoInit}
              onChange={(e) => {
                const enabled = e.target.checked;
                setAutoInit(enabled);
                try {
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('lc0_auto_init_best', enabled ? '1' : '0');
                  }
                } catch {}
              }}
              className="mr-2"
            />
            Enable
          </label>
          <button
            onClick={() => {
              const best = pickBestNetwork(networks);
              if (!best) {
                alert('No networks available');
                return;
              }
              initNetwork(best.name);
            }}
            disabled={networks.length === 0 || loading}
            className="rounded-md border border-border px-2 py-1"
          >
            Auto-select best
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-3">
        {networks.length === 0 && <div className="text-muted-foreground">No networks found</div>}
        {networks.map((network) => (
          <div key={network.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{network.name}</div>
              <div className="text-xs text-muted-foreground">
                {Math.round(network.size / 1024)} KB | {new Date(network.mtime).toLocaleString()}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => initNetwork(network.name)} className="rounded-md border border-border px-2 py-1">
                Init
              </button>
              <a
                href={`/networks/${encodeURIComponent(network.name)}`}
                className="rounded-md border border-border px-2 py-1"
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
