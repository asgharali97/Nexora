'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
}

export default function SetupPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);

      const orgResponse = await fetch(`/api/organizations?slug=${orgSlug}`);
      const orgData = await orgResponse.json();

      if (!orgData?.id) {
        console.error('Organization not found');
        return;
      }

      const response = await fetch(`/api/api-keys?orgId=${orgData.id}`);
      const data = await response.json();

      if (response.ok) {
        const activeKeys = data.filter((key: ApiKey) => key.isActive);
        setApiKeys(activeKeys);
        if (activeKeys.length > 0) {
          setSelectedKeyId(activeKeys[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedKey = apiKeys.find((k) => k.id === selectedKeyId);

  const getSnippet = () => {
    if (!selectedKey) return '';

    return `<!-- Nexora Analytics -->
<script src="https://yourdomain.com/nexora.js"></script>
<script>
  nexora.init('${selectedKey.key}');
</script>`;
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-primary text-3xl font-bold">Installation Guide</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Get started with Nexora Analytics by adding our tracking script to your website
        </p>
      </div>

      {apiKeys.length === 0 ? (
        <div className="shadow-s rounded-xl bg-white p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <h3 className="text-primary mt-4 text-lg font-medium">No API Keys Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            You need to create an API key before you can install the tracking script.
          </p>
          <div className="mt-6">
            <Link
              href={`/${orgSlug}/settings/api-keys/new`}
              className="bg-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Create Your First API Key
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="shadow-s rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center">
              <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white">
                1
              </div>
              <h2 className="text-primary ml-3 text-xl font-bold">Select API Key</h2>
            </div>
            <div>
              <Label className="text-muted-foreground mb-2 block text-sm font-medium">
                Choose an API key for this website
              </Label>
              <Select
                id="apiKey"
                value={selectedKeyId}
                onChange={(e) => setSelectedKeyId(e.target.value)}
                className="shadow-s block w-full max-w-md border sm:text-sm"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="api_name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {apiKeys.map((key) => (
                      <SelectItem key={key.id} value={key.name} />
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center">
              <div className="bg-primary text-popover flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold">
                2
              </div>
              <h2 className="text-primary ml-3 text-xl font-bold">Add Tracking Script</h2>
            </div>

            <p className="text-muted-foreground mb-4 text-sm">
              Copy and paste this code snippet into the
              <code className="rounded bg-gray-100 px-1 py-0.5">&lt;head&gt;</code> section of your
              website, just before the closing{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5">&lt;/head&gt;</code> tag.
            </p>

            <div className="relative">
              <pre className="bg-primary overflow-x-auto rounded-2xl p-4 text-sm text-gray-100">
                <code>{getSnippet()}</code>
              </pre>
              <button
                onClick={handleCopySnippet}
                className="bg-foreground hover:bg-foreground/80 absolute top-2 right-2 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-300"
              >
                {copiedSnippet ? (
                  <>
                    <svg
                      className="mr-1.5 h-4 w-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-1.5 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-s">
            <div className="mb-4 flex items-center">
              <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white">
                3
              </div>
              <h2 className="text-primary ml-3 text-xl font-bold">
                Platform-Specific Instructions
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-primary mb-2 text-lg font-semibold"> HTML / Static Sites</h3>
                <p className="mb-2 text-sm text-gray-600">
                  Add the script to every page you want to track, or add it to your template's
                  <code className="rounded bg-gray-100 px-1 py-0.5">&lt;head&gt;</code> section.
                </p>
                <div className="rounded bg-gray-50 p-3 text-sm">
                  <code className="text-gray-800">
                    &lt;!DOCTYPE html&gt;
                    <br />
                    &lt;html&gt;
                    <br />
                    &nbsp;&nbsp;&lt;head&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;!-- Your existing head content --&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">&lt;!-- Nexora Analytics --&gt;</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">
                      &lt;script src="https://yourdomain.com/nexora.js"&gt;&lt;/script&gt;
                    </span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">
                      &lt;script&gt;nexora.init('{selectedKey?.key}');&lt;/script&gt;
                    </span>
                    <br />
                    &nbsp;&nbsp;&lt;/head&gt;
                    <br />
                    &nbsp;&nbsp;&lt;body&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;!-- Your content --&gt;
                    <br />
                    &nbsp;&nbsp;&lt;/body&gt;
                    <br />
                    &lt;/html&gt;
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-primary mb-2 text-lg font-semibold"> React / Next.js</h3>
                <p className="mb-2 text-sm text-gray-600">
                  For Next.js, add the script to your{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5">_document.tsx</code> or{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5">layout.tsx</code> file:
                </p>
                <div className="rounded bg-gray-50 p-3 text-sm">
                  <code className="text-gray-800">
                    <span className="text-purple-600">import</span> Script{' '}
                    <span className="text-purple-600">from</span>{' '}
                    <span className="text-green-600">'next/script'</span>
                    <br />
                    <br />
                    <span className="text-purple-600">
                      export default function
                    </span> RootLayout() {'{'}
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-600">return</span> (<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;html&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;head&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">
                      &lt;Script src="https://yourdomain.com/nexora.js" /&gt;
                    </span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">&lt;Script id="nexora-init"&gt;</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">{`nexora.init('${selectedKey?.key}');`}</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-primary">&lt;/Script&gt;</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/head&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;body&gt;{'{children}'}&lt;/body&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/html&gt;
                    <br />
                    &nbsp;&nbsp;)
                    <br />
                    {'}'}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-primary mb-2 text-lg font-semibold"> WordPress</h3>
                <p className="mb-2 text-sm text-gray-600">
                  Add the script to your theme's
                  <code className="rounded bg-gray-100 px-1 py-0.5">header.php</code> file, or use a
                  plugin like "Insert Headers and Footers":
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                  <li>Go to Appearance → Theme Editor</li>
                  <li>
                    Open <code className="rounded bg-gray-100 px-1 py-0.5">header.php</code>
                  </li>
                  <li>
                    Paste the tracking script before{' '}
                    <code className="rounded bg-gray-100 px-1 py-0.5">&lt;/head&gt;</code>
                  </li>
                  <li>Save changes</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-s">
            <div className="mb-4 flex items-center">
              <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white">
                4
              </div>
              <h2 className="text-primary ml-3 text-xl font-bold">Verify Installation</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-primary/60" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-muted-foreground">
                  Visit your website and check the browser console (F12) for any Nexora-related
                  errors
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-primary/60" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-muted-foreground">
                  Open your browser's Network tab and look for requests to
                  <code className="rounded bg-gray-100 px-1 py-0.5">/api/track</code>
                </p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-primary/60" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-muted-foreground">
                  Check your analytics dashboard in a few minutes to see if events are being tracked
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href={`/${orgSlug}/analytics`}
                className="inline-flex items-center rounded-full border border-transparent bg-primary px-4 py-2 text-sm font-medium text-popover shadow-s hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-primary/70"
              >
                View Analytics Dashboard
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Track Custom Events</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>You can also track custom events using the JavaScript API:</p>
                  <pre className="mt-2 overflow-x-auto rounded bg-blue-100 p-2 text-xs">
                    <code>{`// Track a custom event
nexora.track('button_clicked', {
  button_name: 'Sign Up',
  page: 'Homepage'
});

// Track form submission
nexora.track('form_submitted', {
  form_name: 'Contact Form',
  success: true
});`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
