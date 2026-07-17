import { Link, useRouterState } from "@tanstack/react-router";
import { LuNotebook } from "react-icons/lu";
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  NotebookPen,
  Repeat,
  ClipboardCheck,
  FileQuestion,
  Target,
  BarChart3,
  Trophy,
  Settings as SettingsIcon,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Main",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "Learn",
    items: [
      { to: "/subjects", label: "Subjects", icon: BookOpen },
      { to: "/revision", label: "Revision", icon: Repeat },
    ]
  },
  {
    label: "Practice",
    items: [
      { to: "/pyq", label: "PYQ Tracker", icon: FileQuestion },
      { to: "/mocks", label: "Mock Tests", icon: ClipboardCheck },
    ]
  },
  {
    label: "Track",
    items: [
      { to: "/timer", label: "Study Timer", icon: Timer },
      { to: "/log", label: "Study Log", icon: NotebookPen },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Progress",
    items: [
      { to: "/goals", label: "Goals", icon: Target },
      { to: "/achievements", label: "Achievements", icon: Trophy },
    ]
  },
  {
    label: "Config",
    items: [
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ]
  }
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-lg">
            <LuNotebook className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-bold">GatePrep</div>
            <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">Prep Dashboard</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {group.label !== "Main" && group.label !== "Config" && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
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
    </Sidebar>
  );
}
