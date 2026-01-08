'use client';

import { useState, useEffect } from 'react';
import { Code, Copy, Check, Key, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Separator } from '@/src/components/ui/separator';
import Link from 'next/link';

interface ApiKey {
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    orgId: string;
    hashKey: string;
    lastUsed: Date | null;
}

interface SetupPageClientProps {
  apiKeys: ApiKey[];
  orgSlug: string;
}

export default function SetupPageClient({ apiKeys, orgSlug }: SetupPageClientProps) {
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedCustom, setCopiedCustom] = useState(false);

  useEffect(() => {
    if (apiKeys.length > 0 && !selectedKeyId) {
      setSelectedKeyId(apiKeys[0].id);
    }
  }, [apiKeys]);

  const selectedKey = apiKeys.find((k) => k.id === selectedKeyId);

  const getInstallSnippet = () => {
    if (!selectedKey) return '';
    return `<!-- Nexora Analytics -->
<script src="https://yourdomain.com/nexora.js"></script>
<script>
  nexora.init('${selectedKey.key}');
</script>`;
  };

  const getCustomEventSnippet = () => {
    return `// Track a custom event
nexora.track('button_clicked', {
  button_name: 'Sign Up',
  page: 'Homepage'
});

// Track form submission
nexora.track('form_submitted', {
  form_name: 'Contact Form',
  success: true
});`;
  };

  const handleCopy = (text: string, setCopied: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Installation Guide</h1>
          <p className="text-muted-foreground mt-1">
            Get started with Nexora Analytics by setting up tracking on your website
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Key className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No API Keys Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              You need to create an API key before you can install the tracking script.
            </p>
            <Link href={`/${orgSlug}/api-keys`}>
              <Button className="bg-secondary-light hover:bg-muted/50 shadow-s text-black">
                <Key className="mr-2 h-4 w-4" />
                Create Your First API Key
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Installation Guide</h1>
          <p className="text-muted-foreground mt-1">
            Add Nexora Analytics tracking to your website in minutes
          </p>
        </div>
        <Link href={`/${orgSlug}/api-keys`}>
          <Button
            size="sm"
            variant="outline"
            className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
          >
            <Key className="mr-2 h-4 w-4" />
            Manage API Keys
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div>
              <CardTitle>Select API Key</CardTitle>
              <CardDescription>Choose which API key to use for tracking</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select an API key" />
              </SelectTrigger>
              <SelectContent>
                {apiKeys.map((key) => (
                  <SelectItem key={key.id} value={key.id}>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      {key.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Each API key can be used for different websites or environments
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <div>
              <CardTitle>Add Tracking Script</CardTitle>
              <CardDescription>
                Copy and paste this code into the &lt;head&gt; section of your website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-muted bg-muted/30">
            <Code className="h-4 w-4" />
            <AlertDescription>
              Place the tracking script just before the closing <code>&lt;/head&gt;</code> tag on
              every page you want to track
            </AlertDescription>
          </Alert>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="language-html">
                <span className="text-slate-500">&lt;!-- Nexora Analytics --&gt;</span>
                {'\n'}
                <span className="text-pink-400">&lt;script</span>{' '}
                <span className="text-sky-300">src</span>
                <span className="text-slate-50">=</span>
                <span className="text-emerald-300">"https://yourdomain.com/nexora.js"</span>
                <span className="text-pink-400">&gt;&lt;/script&gt;</span>
                {'\n'}
                <span className="text-pink-400">&lt;script&gt;</span>
                {'\n'}
                {'  '}
                <span className="text-sky-300">nexora</span>
                <span className="text-slate-50">.</span>
                <span className="text-yellow-300">init</span>
                <span className="text-slate-50">(</span>
                <span className="text-emerald-300">'{selectedKey?.key}'</span>
                <span className="text-slate-50">);</span>
                {'\n'}
                <span className="text-pink-400">&lt;/script&gt;</span>
              </code>
            </pre>
            <Button
              onClick={() => handleCopy(getInstallSnippet(), setCopiedSnippet)}
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
            >
              {copiedSnippet ? (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <div>
              <CardTitle>Platform-Specific Instructions</CardTitle>
              <CardDescription>
                Choose your platform for detailed installation steps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React/Next.js</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add the tracking script to every page, or include it in your template's{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;head&gt;</code>{' '}
                section.
              </p>
              <div className="relative">
                <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto text-sm">
                  <code>
                    <span className="text-slate-500">&lt;!DOCTYPE html&gt;</span>
                    {'\n'}
                    <span className="text-pink-400">&lt;html&gt;</span>
                    {'\n'}
                    {'  '}
                    <span className="text-pink-400">&lt;head&gt;</span>
                    {'\n'}
                    {'    '}
                    <span className="text-slate-500">&lt;!-- Your existing head content --&gt;</span>
                    {'\n'}
                    {'    '}
                    <span className="text-emerald-400">&lt;!-- Nexora Analytics --&gt;</span>
                    {'\n'}
                    {'    '}
                    <span className="text-pink-400">&lt;script</span>{' '}
                    <span className="text-sky-300">src</span>
                    <span className="text-slate-50">=</span>
                    <span className="text-emerald-300">"https://yourdomain.com/nexora.js"</span>
                    <span className="text-pink-400">&gt;&lt;/script&gt;</span>
                    {'\n'}
                    {'    '}
                    <span className="text-pink-400">&lt;script&gt;</span>
                    <span className="text-sky-300">nexora</span>
                    <span className="text-slate-50">.</span>
                    <span className="text-yellow-300">init</span>
                    <span className="text-slate-50">(</span>
                    <span className="text-emerald-300">'{selectedKey?.key}'</span>
                    <span className="text-slate-50">)</span>
                    <span className="text-pink-400">&lt;/script&gt;</span>
                    {'\n'}
                    {'  '}
                    <span className="text-pink-400">&lt;/head&gt;</span>
                    {'\n'}
                    {'  '}
                    <span className="text-pink-400">&lt;body&gt;</span>
                    {'\n'}
                    {'    '}
                    <span className="text-slate-500">&lt;!-- Your content --&gt;</span>
                    {'\n'}
                    {'  '}
                    <span className="text-pink-400">&lt;/body&gt;</span>
                    {'\n'}
                    <span className="text-pink-400">&lt;/html&gt;</span>
                  </code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="react" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For Next.js, add the script to your{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">layout.tsx</code> or{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">_document.tsx</code> file.
              </p>
              <div className="relative">
                <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto text-sm">
                  <code>
                    <span className="text-purple-400">import</span>{' '}
                    <span className="text-sky-300">Script</span>{' '}
                    <span className="text-purple-400">from</span>{' '}
                    <span className="text-emerald-300">'next/script'</span>
                    {'\n\n'}
                    <span className="text-purple-400">export default function</span>{' '}
                    <span className="text-yellow-300">RootLayout</span>
                    <span className="text-slate-50">{'() {'}</span>
                    {'\n'}
                    {'  '}
                    <span className="text-purple-400">return</span>{' '}
                    <span className="text-slate-50">{'('}</span>
                    {'\n'}
                    {'    '}
                    <span className="text-pink-400">&lt;html&gt;</span>
                    {'\n'}
                    {'      '}
                    <span className="text-pink-400">&lt;head&gt;</span>
                    {'\n'}
                    {'        '}
                    <span className="text-pink-400">&lt;Script</span>{' '}
                    <span className="text-sky-300">src</span>
                    <span className="text-slate-50">=</span>
                    <span className="text-emerald-300">"https://yourdomain.com/nexora.js"</span>{' '}
                    <span className="text-pink-400">/&gt;</span>
                    {'\n'}
                    {'        '}
                    <span className="text-pink-400">&lt;Script</span>{' '}
                    <span className="text-sky-300">id</span>
                    <span className="text-slate-50">=</span>
                    <span className="text-emerald-300">"nexora-init"</span>
                    <span className="text-pink-400">&gt;</span>
                    {'\n'}
                    {'          '}
                    <span className="text-sky-300">nexora</span>
                    <span className="text-slate-50">.</span>
                    <span className="text-yellow-300">init</span>
                    <span className="text-slate-50">(</span>
                    <span className="text-emerald-300">'{selectedKey?.key}'</span>
                    <span className="text-slate-50">);</span>
                    {'\n'}
                    {'        '}
                    <span className="text-pink-400">&lt;/Script&gt;</span>
                    {'\n'}
                    {'      '}
                    <span className="text-pink-400">&lt;/head&gt;</span>
                    {'\n'}
                    {'      '}
                    <span className="text-pink-400">&lt;body&gt;</span>
                    <span className="text-slate-50">{'{'}</span>
                    <span className="text-sky-300">children</span>
                    <span className="text-slate-50">{'}'}</span>
                    <span className="text-pink-400">&lt;/body&gt;</span>
                    {'\n'}
                    {'    '}
                    <span className="text-pink-400">&lt;/html&gt;</span>
                    {'\n'}
                    {'  '}
                    <span className="text-slate-50">{')'}</span>
                    {'\n'}
                    <span className="text-slate-50">{'}'}</span>
                  </code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="wordpress" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Add the script to your theme or use a plugin like "Insert Headers and Footers"
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    1
                  </div>
                  <p className="text-sm">Go to Appearance → Theme Editor</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    2
                  </div>
                  <p className="text-sm">
                    Open <code className="bg-muted px-1.5 py-0.5 rounded text-xs">header.php</code>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    3
                  </div>
                  <p className="text-sm">
                    Paste the tracking script before{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;/head&gt;</code>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    4
                  </div>
                  <p className="text-sm">Save changes and refresh your site</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              4
            </div>
            <div>
              <CardTitle>Verify Installation</CardTitle>
              <CardDescription>Check that tracking is working correctly</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Check Browser Console</p>
                <p className="text-muted-foreground">
                  Open DevTools (F12) and look for Nexora-related messages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Monitor Network Activity</p>
                <p className="text-muted-foreground">
                  Check Network tab for requests to{' '}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/api/track</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">View Dashboard</p>
                <p className="text-muted-foreground">
                  Check your analytics dashboard for incoming events
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-center">
            <Link href={`/${orgSlug}/dashboard`}>
              <Button className="bg-secondary-light hover:bg-muted/50 shadow-s text-black">
                View Analytics Dashboard
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Track Custom Events</CardTitle>
          <CardDescription>Use the JavaScript API to track specific user actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-muted bg-muted/30">
            <Code className="h-4 w-4" />
            <AlertDescription>
              Beyond automatic page view tracking, you can manually track custom events like button
              clicks, form submissions, and user interactions
            </AlertDescription>
          </Alert>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto text-sm">
              <code>
                <span className="text-slate-500">// Track a custom event</span>
                {'\n'}
                <span className="text-sky-300">nexora</span>
                <span className="text-slate-50">.</span>
                <span className="text-yellow-300">track</span>
                <span className="text-slate-50">(</span>
                <span className="text-emerald-300">'button_clicked'</span>
                <span className="text-slate-50">, {'{'}</span>
                {'\n'}
                {'  '}
                <span className="text-sky-300">button_name</span>
                <span className="text-slate-50">:</span>{' '}
                <span className="text-emerald-300">'Sign Up'</span>
                <span className="text-slate-50">,</span>
                {'\n'}
                {'  '}
                <span className="text-sky-300">page</span>
                <span className="text-slate-50">:</span>{' '}
                <span className="text-emerald-300">'Homepage'</span>
                {'\n'}
                <span className="text-slate-50">{'});'}</span>
                {'\n\n'}
                <span className="text-slate-500">// Track form submission</span>
                {'\n'}
                <span className="text-sky-300">nexora</span>
                <span className="text-slate-50">.</span>
                <span className="text-yellow-300">track</span>
                <span className="text-slate-50">(</span>
                <span className="text-emerald-300">'form_submitted'</span>
                <span className="text-slate-50">, {'{'}</span>
                {'\n'}
                {'  '}
                <span className="text-sky-300">form_name</span>
                <span className="text-slate-50">:</span>{' '}
                <span className="text-emerald-300">'Contact Form'</span>
                <span className="text-slate-50">,</span>
                {'\n'}
                {'  '}
                <span className="text-sky-300">success</span>
                <span className="text-slate-50">:</span>{' '}
                <span className="text-purple-400">true</span>
                {'\n'}
                <span className="text-slate-50">{'});'}</span>
              </code>
            </pre>
            <Button
              onClick={() => handleCopy(getCustomEventSnippet(), setCopiedCustom)}
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
            >
              {copiedCustom ? (
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
        </CardContent>
      </Card>
    </div>
  );
}