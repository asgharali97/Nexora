'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, ChevronRight } from 'lucide-react';

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
import { ActivityIcon, ActivityIconHandle } from '@/src/components/ui/activity';
import { ChartColumnIncreasingIcon, ChartColumnIncreasingIconHandle } from '@/src/components/ui/chart-column-increasing';
import { ChevronsLeftRightIcon, ChevronsLeftRightIconHandle } from '@/src/components/ui/chevrons-left-right';
import { KeyIcon, KeyIconHandle } from '@/src/components/ui/key';
import { SettingsIcon, SettingsIconHandle } from '@/src/components/ui/settings';

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
        icon: ChartColumnIncreasingIcon
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
        icon: ChevronsLeftRightIcon
      },
      {
        title: 'API Keys',
        url: '/settings/api-keys',
        icon: KeyIcon
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: SettingsIcon
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
  const activityIconRef = React.useRef<ActivityIconHandle>(null);
  const chartIconRef = React.useRef<ChartColumnIncreasingIconHandle>(null);
  const chevronsIconRef = React.useRef<ChevronsLeftRightIconHandle>(null);
  const keyIconRef = React.useRef<KeyIconHandle>(null);
  const settingsIconRef = React.useRef<SettingsIconHandle>(null);

  const isActive = (url: string) => {
    const fullPath = `/${orgSlug}${url}`;
    return pathname === fullPath || pathname?.startsWith(fullPath + '/');
  };

  const getIconRef = (icon: any) => {
    if (icon === ActivityIcon) return activityIconRef;
    if (icon === ChartColumnIncreasingIcon) return chartIconRef;
    if (icon === ChevronsLeftRightIcon) return chevronsIconRef;
    if (icon === KeyIcon) return keyIconRef;
    if (icon === SettingsIcon) return settingsIconRef;
    return null;
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
                {group.items.map((item) => {
                  const iconRef = getIconRef(item.icon);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                        onMouseEnter={() => iconRef?.current?.startAnimation()}
                        onMouseLeave={() => iconRef?.current?.stopAnimation()}
                      >
                        <Link href={`/${orgSlug}${item.url}`} className="flex items-center gap-2">
                          <item.icon ref={iconRef} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
