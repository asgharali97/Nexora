'use client';

import { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import MembersList from '@/src/components/MembersList';
import AddMemberForm from '@/src/components/AddMembers';
import { Role } from '@/generated/prisma/enums';

interface MembersPageClientProps {
  members: any[];
  currentUserRole: Role;
  orgId: string;
  canManageMembers: boolean;
}

export default function MembersPageClient({
  members,
  currentUserRole,
  orgId,
  canManageMembers,
}: MembersPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (members.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization members and their roles
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Get started by inviting your first team member to the organization.
            </p>
            {canManageMembers && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary-light hover:bg-muted/50 shadow-s text-black">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Your First Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to your organization. They will receive an email invitation.
                    </DialogDescription>
                  </DialogHeader>
                  <AddMemberForm orgId={orgId} onSuccess={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization members and their roles
          </p>
        </div>
        {canManageMembers && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to your organization. They will receive an email invitation.
                </DialogDescription>
              </DialogHeader>
              <AddMemberForm orgId={orgId} onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.role === 'ADMIN' || m.role === 'OWNER').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.role === 'MEMBER').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>
            A list of all members in your organization with their roles and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersList members={members} currentUserRole={currentUserRole} orgId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
}