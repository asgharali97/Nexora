'use client';
import { removeMember, updateMember } from '@/src/app/actions/members';
import { Role } from '@/generated/prisma/enums';
import { Membership } from '@/generated/prisma/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/src/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
export default function MembersList({
  members,
  currentUserRole,
  orgId
}: {
  members: Membership[];
  currentUserRole: Role;
  orgId: string;
}) {
  const canRemove = ['OWNER', 'ADMIN'].includes(currentUserRole);
  const canChangeRoles = currentUserRole === 'OWNER';

  async function handleRemove(membershipId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    const formData = new FormData();
    formData.append('orgId', orgId);
    formData.append('membershipId', membershipId);

    const result = await removeMember(formData);
    if (result.error) toast(result.error);
    toast('Member remove successfuly');
  }

  async function handleRoleChange(membershipId: string, newRole: Role) {
    const formData = new FormData();
    formData.append('orgId', orgId);
    formData.append('membershipId', membershipId);
    formData.append('role', newRole);

    const result = await updateMember(formData);
    if (result.error) toast(result.error);
    toast('Updated Role of Member');
  }

  return (
    <div className="min-h-screen w-full px-16 py-6">
      <Table>
        <TableCaption>A list of members in your organization.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.user.name || member.user.email}
                </TableCell>
                <TableCell>{member.user.email}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-4">
                    {canRemove && member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="rounded px-4 py-2 text-destructive hover:bg-muted  cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                    {canChangeRoles && member.role !== 'OWNER' ? (
                      <Select
                        value={member.role}
                        onValueChange={(e) =>
                          handleRoleChange(member.id, e.currentTarget.value as Role)
                        }
                      >
                        <SelectTrigger className="bg-background w-auto rounded-full px-4 cursor-pointer">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="rounded bg-muted-foreground/10 px-3 py-1 text-foreground/80 font-medium shadow-s">{member.role}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
