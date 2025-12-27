import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/src/components/ui/sidebar';
import { Separator } from '@/src/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb';
import { AppSidebar } from '@/src/components/dashboard/AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    orgSlug: string;
  };
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const session = await user();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const {orgSlug} = await params;
  if (!orgSlug) {
    redirect('/onboarding')
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      memberships: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!organization || organization.memberships.length === 0) {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <AppSidebar
        orgSlug={orgSlug}
        orgName={organization.name}
        userEmail={session.user.email || undefined}
        userName={session.user.name || undefined}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${orgSlug}/analytics`}>
                  {organization.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
