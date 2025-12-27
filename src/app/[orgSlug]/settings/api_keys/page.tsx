'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, Trash2, Plus, Key } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/src/components/ui/alert-dialog';
import { toast } from 'sonner';

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
  const orgSlug = params.orgSlug as string;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const orgResponse = await fetch(`/api/organizations?slug=${orgSlug}`);
      const orgData = await orgResponse.json();

      if (!orgData?.id) return;

      const response = await fetch(`/api/api-keys?orgId=${orgData.id}`);
      const data = await response.json();

      if (response.ok) {
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast('API key copied to clipboard');
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setApiKeys(
          apiKeys.map((key) => (key.id === keyId ? { ...key, isActive: !currentStatus } : key))
        );
        toast(`API key ${!currentStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast('Failed to update API key');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setKeyToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!keyToDelete) return;

    try {
      const response = await fetch(`/api/api-keys/${keyToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== keyToDelete.id));
        toast('API key deleted successfully');
      }
    } catch (error) {
      toast('Failed to delete API key');
    } finally {
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
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
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for tracking analytics on your websites
          </p>
        </div>
        <Button asChild>
          <Link href={`/${orgSlug}/settings/api-keys/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Key
          </Link>
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Key className="text-muted-foreground h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No API keys</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Get started by creating a new API key
            </p>
            <Button asChild className="mt-6">
              <Link href={`/${orgSlug}/settings/api-keys/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted relative rounded px-2 py-1 text-sm">
                        {maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyKey(apiKey.key)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                      {apiKey.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(apiKey.lastUsed)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(apiKey.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(apiKey.id, apiKey.isActive)}
                      >
                        {apiKey.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(apiKey.id, apiKey.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the API key "{keyToDelete?.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
