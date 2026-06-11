import { useState } from 'react';
import { useFixtures } from '../hooks/useFixtures';
import { exportUserData, importUserData } from '../api/userdata';
import { getLastFixtureUpdate } from '../api/fixtures';

export function More() {
  const { refreshFixtures, loading } = useFixtures();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const lastUpdate = getLastFixtureUpdate();

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worldcup-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      await importUserData(data);
      alert('Data imported successfully! Refreshing...');
      window.location.reload();
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateFixtures = async () => {
    if (confirm('Update fixtures? This will not affect your entered scores.')) {
      await refreshFixtures();
      alert('Fixtures updated successfully!');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-30 safe-top">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">More</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* App Info */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">FIFA World Cup 2026 Tracker</h2>
          <p className="text-gray-400 text-sm mb-2">
            A premium, spoiler-free tracker for the 2026 FIFA World Cup.
          </p>
          <p className="text-gray-400 text-sm">
            All scores and standings are based on your manually entered results only.
          </p>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Data Management</h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full btn-secondary flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Data</span>
              </div>
              {exporting && <span className="text-sm">Exporting...</span>}
            </button>

            <label className="w-full btn-secondary flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Import Data</span>
              </div>
              {importing && <span className="text-sm">Importing...</span>}
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>
        </div>

        {/* Fixtures Management */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Fixtures</h2>
          <div className="space-y-3">
            <button
              onClick={handleUpdateFixtures}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Update Fixtures</span>
              </div>
              {loading && <span className="text-sm">Updating...</span>}
            </button>
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdate).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Version 1.0.0</p>
            <p>Made for iPad with ❤️</p>
            <p>Times shown in Australia/Perth timezone (AWST)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
