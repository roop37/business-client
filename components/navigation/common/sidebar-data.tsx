import {
  BadgePercent,
  CalendarDaysIcon,
  ChartColumn,
  Code2,
  CreditCard,
  History,
  LayoutDashboard,
  MegaphoneIcon,
  MessageSquareHeart,
  QrCode,
  SettingsIcon,
  ShoppingBag,
  TicketPercent,
  Trophy,
  UsersRoundIcon,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type TSidebarSubItem = {
  title: string;
  href: string;
  /**
   * Renders the row with a "Coming Soon" pill, dimmed text, and a
   * non-navigating click handler. Use this for v1.5 surfaces that
   * exist as placeholders but aren't ready for production traffic.
   */
  comingSoon?: boolean;
};

export type TSidebarItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  id?: string;
  subItems?: TSidebarSubItem[];
  /** Same semantics as the sub-item flag — applies to the top-level row. */
  comingSoon?: boolean;
};

export const getSidebarList = (): TSidebarItem[] => [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    active: true,
    id: "sidebar-dashboard",
  },
  {
    title: "Events",
    href: "/events",
    icon: CalendarDaysIcon,
    active: true,
    id: "sidebar-events",
  },
  {
    title: "Campaigns",
    href: "/campaigns/marketing-credit",
    icon: MegaphoneIcon,
    active: true,
    id: "sidebar-campaigns",
    subItems: [
      { title: "Marketing Credit", href: "/campaigns/marketing-credit" },
      { title: "Email", href: "/campaigns/email" },
      { title: "WhatsApp", href: "/campaigns/whatsapp" },
      { title: "Push Notification", href: "/campaigns/push", comingSoon: true },
      { title: "SMS", href: "/campaigns/sms", comingSoon: true },
      { title: "Instagram", href: "/campaigns/instagram", comingSoon: true },
    ],
  },
  {
    title: "Rewards & Loyalties",
    href: "/coupons",
    icon: BadgePercent,
    active: true,
    id: "sidebar-rewards",
    subItems: [
      { title: "Promo Code", href: "/coupons" },
      {
        title: "Loyalty Settings",
        href: "/rewards/loyalty-settings",
      },
    ],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingBag,
    active: true,
    id: "sidebar-orders",
  },
  {
    title: "Customers",
    href: "/customer",
    icon: UsersRoundIcon,
    active: true,
    id: "sidebar-customers",
  },
  {
    title: "Community",
    href: "/community",
    icon: Trophy,
    active: true,
    id: "sidebar-community",
  },
  {
    title: "Feedbacks",
    href: "/feedbacks",
    icon: MessageSquareHeart,
    active: true,
    id: "sidebar-feedbacks",
  },
  {
    title: "Automations",
    href: "/automations",
    icon: Workflow,
    active: true,
    id: "sidebar-automations",
  },
  {
    title: "Scanners",
    href: "/scanners",
    icon: QrCode,
    active: true,
    id: "sidebar-scanners",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: ChartColumn,
    active: true,
    id: "sidebar-reports",
  },
  {
    title: "Payment",
    href: "/payment/payouts",
    icon: CreditCard,
    active: true,
    id: "sidebar-payment",
    subItems: [
      { title: "Payout Details", href: "/payment/payouts" },
      { title: "Settlement History", href: "/payment/settlement-history" },
      { title: "Payout Invoices", href: "/payment/invoices" },
    ],
  },
  {
    title: "Teams",
    href: "/teams",
    icon: UsersRoundIcon,
    active: true,
    id: "sidebar-team",
  },
  // Activity Log moved into the Settings modal; no longer a sidebar item.
  {
    title: "Developers",
    href: "/org-settings/developers",
    icon: Code2,
    active: true,
    id: "sidebar-developers",
    subItems: [
      { title: "API keys", href: "/org-settings/developers" },
      { title: "Webhooks", href: "/org-settings/developers/webhooks" },
      { title: "Whitelabel", href: "/org-settings/developers/whitelabel" },
    ],
  },
  {
    title: "Settings",
    href: "/org-settings",
    icon: SettingsIcon,
    active: true,
  },
];
