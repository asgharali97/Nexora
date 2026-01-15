'use client';

import { useState } from 'react';
import { Key, Copy, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { toast } from 'sonner';
interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onSuccess?: () => void;
}

export default function CreateApiKeyDialog({
  open,
  onOpenChange,
  orgId,
  onSuccess
}: CreateApiKeyDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          orgId: orgId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedKey(data.key);
      } else {
        toast(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast('Failed to create API key');
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
    setCreatedKey(null);
    setName('');
    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (createdKey) {
      return;
    }
    setName('');
    setCreatedKey(null);
    onOpenChange(false);
  };

  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-[550px]"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">API Key Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Please copy your API key now. For security reasons, you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> Make sure to copy your API key now. You won't be able to
                see it again!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="api-key">Your API Key</Label>
              <div className="flex gap-2">
                <Input id="api-key" value={createdKey} readOnly className="font-mono text-sm" />
                <Button onClick={handleCopy} variant="outline" className="shrink-0" size="sm">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={handleDone}
                className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            API keys are used to authenticate requests from your website to track analytics events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Production Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              Choose a descriptive name to help you identify where this key is used.
            </p>
          </div>

          <Alert className="border-muted bg-muted/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Keep your API keys secure and never share them publicly.
              You'll only be able to view the full key once after creation.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                  Creating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Create API Key
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
