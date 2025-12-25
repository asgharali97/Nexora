import { DashboardLayoutServer } from "@/src/components/dashboard/DashboardLayoutServer";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    orgSlug: string;
  };
}

export default function OrgLayout({ children, params }: LayoutProps) {
  return (
    <DashboardLayoutServer orgSlug={"nexorafirst"}>
      {children}
    </DashboardLayoutServer>
  );
}