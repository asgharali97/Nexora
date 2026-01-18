'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMember } from '@/src/app/actions/members';
import { addMemberSchema, type addMemberInput } from '@/src/lib/validations/org.schema';
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
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<addMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
      orgId
    },
  });

  console.log('orgId', orgId);
  const onSubmit = async (data: addMemberInput) => {
    console.log('orgId', orgId);
    console.log(data);
    try {
      const result = await addMember({ ...data, orgId });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Member invited successfully');
        reset();
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to add member');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('orgId')} />
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="member@example.com"
          {...register('email')}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email.message}</p>
        )}
        <p className="text-muted-foreground text-xs">
          The member will receive an invitation email to join the organization.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
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
                <SelectItem value="ANALYST">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Analyst</span>
                    <span className="text-muted-foreground text-xs">Can view analytics and reports</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-red-500 text-xs">{errors.role.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
        >
          {isSubmitting ? (
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