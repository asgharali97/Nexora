'use client';
import React, { useActionState, useState } from 'react';
import { addMember } from '../app/actions/members';
import { useFormStatus } from 'react-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';

const AddMembers = ({ orgId }: { orgId: string }) => {
  const [state, formAction] = useActionState(addMember, { error: null, success: false });
  const [role, setRole] = useState('MEMBER');

  return (
    <div className="bg-secondary-light shadow-s w-md rounded-xl border border-neutral-200 px-6 py-4">
      <h1 className="text-center text-xl font-medium">Add Team Members</h1>
      <form action={formAction} className="my-2 space-y-4">
        <input type="hidden" name="orgId" value={orgId} />
        <input type="hidden" name="role" value={role} />
        
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-lg">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="ring-primary focus:ring-primary bg-background rounded-full px-4 py-5"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-lg">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-background w-full rounded-full px-4 py-5">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-success">Member added successfully!</p>}
        </div>
        
        <div className="flex w-full items-center justify-center">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
};

export default AddMembers;

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-primary text-popover rounded-full disabled:opacity-50 cursor-pointer"
    >
      {pending ? 'Adding...' : 'Add Member'}
    </button>
  );
}