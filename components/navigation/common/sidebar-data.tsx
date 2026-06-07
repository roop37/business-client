import {
  BadgePercent,
  CalendarDaysIcon,
  ChartColumn,
  CreditCard,
  LayoutDashboard,
  MegaphoneIcon,
  QrCode,
  SettingsIcon,
  ShoppingBag,
  UsersRoundIcon,
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
      { title: "WhatsApp", href: "/campaigns/whatsapp" },
      { title: "Meta x Hoizr", href: "/campaigns/meta-hoizr", comingSoon: true },
    ],
  },
  {
    title: "Rewards & Loyalties",
    href: "/rewards",
    icon: BadgePercent,
    active: true,
    id: "sidebar-rewards",
    comingSoon: true,
    subItems: [
      {
        title: "Loyalty Settings",
        href: "/rewards/loyalty-settings",
        comingSoon: true,
      },
      {
        title: "Promo Codes",
        href: "/rewards/promo-codes",
        comingSoon: true,
      },
    ],
  },
  {
    title: "Customers",
    href: "/customer",
    icon: UsersRoundIcon,
    active: true,
    id: "sidebar-customers",
  },
  {
    title: "Tickets",
    href: "/tickets",
    icon: ShoppingBag,
    active: true,
    id: "sidebar-ticket-sales",
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
  {
    title: "Settings",
    href: "/org-settings",
    icon: SettingsIcon,
    active: true,
  },
];
