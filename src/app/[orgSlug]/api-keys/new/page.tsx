'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconChevronLeft } from '@tabler/icons-react';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';

export default function NewApiKeyPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setLoading(true);

    try {
      const orgResponse = await fetch(`/api/organizations?slug=${orgSlug}`);
      const orgData = await orgResponse.json();

      if (!orgData?.id) {
        alert('Organization not found');
        return;
      }

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          orgId: orgData.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedKey(data.key);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    router.push(`/${orgSlug}/settings/api-keys`);
  };

  if (createdKey) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            API Key Created Successfully!
          </h2>
          <p className="mb-6 text-center text-gray-600">
            Please copy your API key now. For security reasons, you won`t be able to see it again.
          </p>

          <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Make sure to copy your API key now. You won`t be able to see it again!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Your API Key</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdKey}
                  readOnly
                  className="block w-full flex-1 rounded-md border-gray-300 bg-gray-50 font-mono shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                >
                  {copied ? (
                    <>
                      <svg
                        className="mr-2 h-5 w-5 text-green-500"
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
                        className="mr-2 h-5 w-5"
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

            <div className="flex justify-between pt-4">
              <Link
                href={`/${orgSlug}/setup`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                View Installation Guide
              </Link>
              <button
                onClick={handleDone}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/${orgSlug}/settings/api-keys`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all"
        >
          <IconChevronLeft className="h-5 w-5" />
          Back to API Keys
        </Link>
      </div>

      <div className="shadow-m p-6 rounded-xl bg-primary-foreground">
        <h1 className="mb-2 text-2xl font-bold text-primary text-center">Create New API Key</h1>
        <p className="mb-6 text-sm text-muted-foreground text-center">
          API keys are used to authenticate requests from your website to track analytics events.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-md">
              Name
            </Label>
            <Input
              id="name"
              type="name"
              placeholder=""
            //   {...register('email')}
              className="ring-primary focus:ring-primary rounded-full px-4 py-5"
            />
          <p className="mt-2 text-sm text-gray-500">
            Choose a descriptive name to help you identify where this key is used.
          </p>
          </div>

          <div className="border-l-4 border-chart-2 bg-blue-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-chart-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Important:</strong> Keep your API keys secure and never share them
                  publicly. You`ll only be able to view the full key once after creation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/${orgSlug}/settings/api-keys`}
              className="inline-flex items-center rounded-full shadow-s bg-secondary-light px-4 py-1 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center rounded-full border border-transparent bg-primary px-4 py-2 text-sm font-medium text-popover shadow-s hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-primary/70"
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create API Key
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
