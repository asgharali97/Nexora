'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date;
}

export default function ApiKeysPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>('');

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
      
      setOrgId(orgData.id);
      
      const response = await fetch(`/api/api-keys?orgId=${orgData.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setApiKeys(data);
      } else {
        console.error('Error fetching API keys:', data.error);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setApiKeys(apiKeys.map(key => 
          key.id === keyId ? { ...key, isActive: !currentStatus } : key
        ));
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error toggling API key:', error);
      alert('Failed to update API key');
    }
  };

  const handleDelete = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage API keys for tracking analytics on your websites
          </p>
        </div>
        <Link
          href={`/${orgSlug}/settings/api-keys/new`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Key
        </Link>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new API key
          </p>
          <div className="mt-6">
            <Link
              href={`/${orgSlug}/settings/api-keys/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create API Key
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => handleCopyKey(apiKey.key)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy to clipboard"
                      >
                        {copiedKey === apiKey.key ? (
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      apiKey.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(apiKey.lastUsed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(apiKey.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleActive(apiKey.id, apiKey.isActive)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      {apiKey.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(apiKey.id, apiKey.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}