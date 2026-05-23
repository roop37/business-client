import {
  HoizrStatusPill,
  HoizrSurface,
  HoizrTable,
} from "@/components/common/hoizr/HoizrSurface";
import {
  Download,
  MoreVertical,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/router";

const rows = [
  ["Weekend Special 2nd Week May", "Limited Time Specials - Grab Yours Now!", "Completed", "08 May 10:00 AM EDT", "11,292", "11,250", "756", "36", "$ 30.98"],
  ["25% OFF Mother's Day Cake offer ...", "25% OFF Mother's Day Special !", "Scheduled", "N/A", "0", "0", "0", "0", "$ 0"],
  ["Cinco de Mayo Campaign - May", "Today Only: Our Cinco Special ...", "Completed", "05 May 11:00 AM EDT", "11,279", "11,237", "1,568", "40", "$ 439.83"],
  ["Weekend Special 1st Week May", "Enjoy Weekend Surprise Just for You", "Scheduled", "N/A", "0", "0", "0", "0", "$ 0"],
  ["Weekend Special 4th Week Apr", "Open Before this Weekend Ends", "Completed", "24 Apr 09:00 AM EDT", "11,197", "11,155", "1,621", "27", "$ 2,142.32"],
  ["10% Dine offer Last reminder", "Claim 10%OFF before its gone", "Completed", "22 Apr 09:00 AM EDT", "11,189", "11,147", "1,735", "15", "$ 2,543.98"],
  ["Weekend Special 3rd Week Apr", "Alert: Gone by Monday our Special ...", "Completed", "17 Apr 09:30 AM EDT", "11,154", "11,113", "1,592", "30", "$ 2,720.26"],
  ["Free Item Tiered Apr", "FREE ITEM on your next order", "Completed", "20 Apr 09:00 AM EDT", "11,183", "11,142", "1,831", "44", "$ 2,890.7"],
  ["Weekend Special 2nd Week Apr", "Claim this Reward for Yourself", "Completed", "10 Apr 09:50 AM EDT", "11,116", "11,075", "1,705", "43", "$ 3,314.07"],
  ["10% OFF on Dine-in", "Flat 10% OFF Your Meal", "Completed", "07 Apr 09:00 AM EDT", "11,099", "11,058", "1,563", "4", "$ 3,856.5"],
];

const headers = [
  "Campaign Name",
  "Email Subject",
  "Status",
  "Sent Date",
  "Mails Sent",
  "Mails Delivered",
  "Mails Opened",
  "Mails Clicked",
  "Net Sales",
  "Target",
  "Schedule Type",
  "Actions",
];

const EmailCampaignsMock = () => {
  const router = useRouter();

  return (
    <HoizrSurface className="flex min-w-0 flex-col p-4 md:p-5">
      <div className="mb-5 flex shrink-0 flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
          <label className="flex h-10 w-full min-w-0 items-center gap-3 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3.5 text-sm text-[var(--owner-fg-3)] sm:w-[320px]">
            <Search size={17} />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Search campaign..."
            />
          </label>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-4 text-sm font-medium text-[var(--owner-fg-1)]">
            Filters
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/campaigns/onboarding/template-select")}
            className="rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-4 py-2 text-sm font-medium text-[var(--owner-fg-1)]"
          >
            Add
          </button>
          <button className="rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] p-2.5 text-[var(--owner-fg-1)]">
            <Download size={18} />
          </button>
          <button className="rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] p-2.5 text-[var(--owner-fg-1)]">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      <HoizrTable
        headers={headers}
        minWidth="1280px"
        wrapperClassName="rounded-lg border border-[var(--owner-border)]"
      >
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-[var(--owner-border)]">
                <td className="max-w-[180px] px-3 py-4 font-medium">{row[0]}</td>
                <td className="max-w-[180px] px-3 py-4 font-medium">{row[1]}</td>
                <td className="px-3 py-4">
                  <HoizrStatusPill status={row[2]} />
                </td>
                {row.slice(3).map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="px-3 py-4">
                    {cell}
                  </td>
                ))}
                <td className="px-3 py-4">All Customers</td>
                <td className="px-3 py-4">later</td>
                <td className="px-3 py-4">
                  <MoreVertical size={18} />
                </td>
              </tr>
            ))}
      </HoizrTable>

      <div className="flex shrink-0 flex-col justify-between gap-4 px-2 pt-5 text-sm text-[var(--owner-fg-3)] sm:flex-row sm:flex-wrap sm:items-center">
        <span>0 of 113 row(s) selected</span>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <span>Rows per page</span>
          <button className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-2">
            10
          </button>
          <span className="text-gray-500">‹ Prev</span>
          <span>1 / 12</span>
          <span>Next ›</span>
        </div>
      </div>
    </HoizrSurface>
  );
};

export default EmailCampaignsMock;
