'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Settings, Key, Code, Building2, ChevronRight } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/src/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/src/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { ActivityIcon } from '../ui/activity';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  orgSlug: string;
  orgName: string;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
}

const navigation = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Analytics',
        url: '/analytics',
        icon: BarChart3
      },
      {
        title: 'Events',
        url: '/events',
        icon: ActivityIcon
      }
    ]
  },
  {
    title: 'Configuration',
    items: [
      {
        title: 'Installation',
        url: '/setup',
        icon: Code
      },
      {
        title: 'API Keys',
        url: '/settings/api-keys',
        icon: Key
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings
      }
    ]
  }
];

export function AppSidebar({
  orgSlug,
  orgName,
  userEmail,
  userName,
  userAvatar,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (url: string) => {
    const fullPath = `/${orgSlug}${url}`;
    return pathname === fullPath || pathname?.startsWith(fullPath + '/');
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${orgSlug}/analytics`}>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Nexora</span>
                  <span className="text-muted-foreground text-xs">Analytics Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <Building2 className="size-4" />
                      <span className="flex-1 truncate text-left">{orgName}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="start">
                    <DropdownMenuItem>
                      <Building2 className="mr-2 size-4" />
                      <span>{orgName}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link href={`/${orgSlug}${item.url}`}>
                        <item.icon className="h-4 w-4"/>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
