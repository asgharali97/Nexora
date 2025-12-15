'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMember } from '@/src/app/actions/members';
import { addMemberSchema, type addMemberInput } from '@/src/lib/validations/org.schema';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const AddMembers = ({ orgId }: { orgId: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<addMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      orgId,
      role: 'MEMBER'
    }
  });
  const role = watch('role');

  const onSubmit = async (data: addMemberInput) => {
    try {
      const result = await addMember(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Member added successfully!');
        reset({ orgId, role: 'MEMBER' });
      }
    } catch (error:any) {
      toast.error(`Something went wrong ${error.message}`);
    }
  };
  return (
    <div className="bg-secondary-light shadow-s w-md rounded-xl border border-neutral-200 px-6 py-4">
      <h1 className="text-center text-xl font-medium">Add Team Members</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="my-2 space-y-4">
        <input type="hidden" {...register('orgId')} />

        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-lg">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="ring-primary focus:ring-primary bg-background rounded-full px-4 py-5"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role" className="text-lg">
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setValue('role', value as 'MEMBER' | 'ADMIN')}
            >
              <SelectTrigger className="bg-background w-full rounded-full px-4 py-5">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-400">{errors.role.message}</p>}
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-popover cursor-pointer rounded-full px-4 py-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMembers;
