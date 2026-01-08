'use client';

import { useState } from 'react';
import { addMember } from '@/src/app/actions/members';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

interface AddMemberFormProps {
  orgId: string;
  onSuccess?: () => void;
}

export default function AddMemberForm({ orgId, onSuccess }: AddMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('orgId', orgId);
    formData.append('email', email);
    formData.append('role', role);

    try {
      const result = await addMember(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Member invited successfully');
        setEmail('');
        setRole('MEMBER');
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="member@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <p className="text-muted-foreground text-xs">
          The member will receive an invitation email to join the organization.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole} disabled={loading}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">
              <div className="flex flex-col items-start">
                <span className="font-medium">Member</span>
                <span className="text-muted-foreground text-xs">Can view and use basic features</span>
              </div>
            </SelectItem>
            <SelectItem value="ADMIN">
              <div className="flex flex-col items-start">
                <span className="font-medium">Admin</span>
                <span className="text-muted-foreground text-xs">Can manage members and settings</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading || !email}
          className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inviting...
            </>
          ) : (
            'Send Invitation'
          )}
        </Button>
      </div>
    </form>
  );
}