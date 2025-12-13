"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/src/app/actions/org";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function CreateOrgForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createOrganization(formData);

      if (result.success && result.orgSlug) {
        router.push(`/${result.orgSlug}/dashboard`);
      } else {
        setError(result.error || "Failed to create organization");
      }
    });
  };

  return (
    <Card className="bg-secondery-light w-full max-w-md rounded-2xl shadow-s">
      <CardHeader className="w-full flex justify-center flex-col items-center">
        <CardTitle className="text-2xl text-foreground font-medium">Create Your Organization</CardTitle>
        <CardDescription className="text-md">
          Get started by creating your first organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-md">Organization Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Acme Inc"
              required
              minLength={2}
              maxLength={50}
              disabled={isPending}
              className="rounded-full"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full rounded-2xl py-2 shadow-m text-popover" disabled={isPending}>
            {isPending ? "Creating..." : "Create Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}