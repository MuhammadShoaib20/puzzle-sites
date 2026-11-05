'use client';

import { useEffect, useState } from 'react';

type IntegrationStatus = {
  connected: boolean;
  status: 'not_connected' | 'connected' | 'verification_failed';
  siteUrl: string;
  hasApiKey: boolean;
  lastSubmittedAt: string | null;
  lastError: string | null;
  indexNow: {
    configured: boolean;
    active: boolean;
    dryRun: boolean;
    lastSubmittedAt: string | null;
  };
};

type Props = { initialSiteUrl: string };

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function SearchEnginesSettings({ initialSiteUrl }: Props) {
  const [siteUrl, setSiteUrl] = useState(initialSiteUrl);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function refreshStatus() {
    const response = await fetch('/api/admin/bing/status', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load integration status.');
    setStatus(result as IntegrationStatus);
    setSiteUrl((result as IntegrationStatus).siteUrl || initialSiteUrl);
  }

  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/bing/status', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load integration status.');
        return result as IntegrationStatus;
      })
      .then((result) => {
        if (cancelled) return;
        setStatus(result);
        setSiteUrl(result.siteUrl || initialSiteUrl);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : 'Could not load integration status.',
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialSiteUrl]);

  async function connect() {
    setPendingAction('connect');
    try {
      const response = await fetch('/api/admin/bing/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, apiKey }),
      });
      const result = await response.json();
      await refreshStatus();
      if (!response.ok) throw new Error(result.error || 'Bing verification failed.');
      setApiKey('');
      setFeedback({
        type: result.warning ? 'error' : 'success',
        message: result.sitemapSubmitted
          ? 'Bing connected and sitemap submitted.'
          : result.warning || 'Bing connected. Sitemap submission may be retried.',
      });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Could not connect Bing.' });
    } finally {
      setPendingAction('');
    }
  }

  async function submitSitemap() {
    setPendingAction('submit');
    try {
      const response = await fetch('/api/admin/bing/submit-sitemap', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit the sitemap.');
      await refreshStatus();
      setFeedback({ type: 'success', message: 'Sitemap submitted to Bing.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Could not submit the sitemap.' });
      await refreshStatus().catch(() => undefined);
    } finally {
      setPendingAction('');
    }
  }

  async function disconnect() {
    setPendingAction('disconnect');
    try {
      const response = await fetch('/api/admin/bing/connect', { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not disconnect Bing.');
      setApiKey('');
      await refreshStatus();
      setFeedback({ type: 'success', message: 'Bing Webmaster Tools disconnected.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Could not disconnect Bing.' });
    } finally {
      setPendingAction('');
    }
  }

  const bingStatus = status?.status === 'connected'
    ? status.lastError
      ? `Connected ✅ — Latest submission failed: ${status.lastError}${status.lastSubmittedAt ? ` Last successful submission: ${formatDate(status.lastSubmittedAt)}.` : ''}`
      : status.lastSubmittedAt
        ? `Connected ✅ — Sitemap submitted on ${formatDate(status.lastSubmittedAt)}`
        : 'Connected ✅ — Sitemap has not been submitted yet.'
    : status?.status === 'verification_failed'
      ? `Verification Failed ❌ — ${status.lastError || 'Verify the site in Bing Webmaster Tools, then reconnect.'}`
      : 'Not Connected';

  return (
    <section className="space-y-6" aria-labelledby="search-engines-heading">
      <div className="admin-head">
        <div>
          <h2 id="search-engines-heading" className="admin-title">Search Engines</h2>
          <p className="admin-sub">Connect webmaster tools and review automatic URL submissions.</p>
        </div>
      </div>

      {feedback && (
        <p
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`rounded-lg border p-3 text-sm ${feedback.type === 'error' ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-700'}`}
        >
          {feedback.message}
        </p>
      )}

      <section className="card space-y-5 p-6" aria-labelledby="bing-heading">
        <div>
          <h3 id="bing-heading" className="text-lg font-bold">Bing Webmaster Tools</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {isLoading ? 'Checking connection…' : bingStatus}
          </p>
        </div>

        {status?.status === 'verification_failed' && (
          <p role="alert" className="text-sm text-red-700">
            Add and verify this site in Bing Webmaster Tools using DNS, XML, meta tag, or GSC import, then reconnect.
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="bing-site-url" className="mb-1 block text-sm font-medium">Site URL</label>
            <input
              id="bing-site-url"
              type="url"
              value={siteUrl}
              onChange={(event) => setSiteUrl(event.target.value)}
              placeholder="https://example.com/"
              autoComplete="url"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="bing-api-key" className="mb-1 block text-sm font-medium">Bing API Key</label>
            <input
              id="bing-api-key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={status?.hasApiKey ? 'Saved securely; leave blank to reuse' : 'Paste your Bing API key'}
              autoComplete="new-password"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={connect} disabled={!!pendingAction || isLoading}>
            {pendingAction === 'connect' ? 'Verifying…' : status?.hasApiKey ? 'Reconnect / Verify' : 'Connect / Verify'}
          </button>
          {status?.connected && (
            <button type="button" className="btn btn-secondary" onClick={submitSitemap} disabled={!!pendingAction}>
              {pendingAction === 'submit' ? 'Submitting…' : 'Submit Sitemap'}
            </button>
          )}
          {status?.hasApiKey && (
            <button type="button" className="btn btn-secondary" onClick={disconnect} disabled={!!pendingAction}>
              {pendingAction === 'disconnect' ? 'Disconnecting…' : 'Disconnect'}
            </button>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Generate the key in Bing Webmaster Tools → Settings → API Access. The key is encrypted before it is stored.
        </p>
      </section>

      <section className="card space-y-3 p-6" aria-labelledby="indexnow-heading">
        <div>
          <h3 id="indexnow-heading" className="text-lg font-bold">IndexNow</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {status?.indexNow.active
              ? 'IndexNow: Active ✅'
              : status?.indexNow.configured
                ? `Configured${status.indexNow.dryRun ? ' · dry-run only' : ''}`
                : 'Not configured ❌'}
          </p>
        </div>
        {status?.indexNow.lastSubmittedAt && (
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            Last submission: {formatDate(status.indexNow.lastSubmittedAt)}
          </p>
        )}
      </section>
    </section>
  );
}