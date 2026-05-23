"use client";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircle,
  QrCode,
  Search,
  Send,
  Sparkles,
  TicketCheck,
  UsersRound,
} from "lucide-react";

const eventTiles = [
  { name: "Sundown", city: "Goa", price: "₹1,499", surface: "bg-[#EF7B24]" },
  { name: "Subsonic", city: "Mumbai", price: "₹899", surface: "bg-[#315E9E]" },
  { name: "Bassline", city: "BLR", price: "₹1,299", surface: "bg-[#161412]" },
  { name: "Reverb", city: "Delhi", price: "₹1,099", surface: "bg-[#B88A3A]" },
];

const PARTY_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";
const DOOR_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85";

const GraphiteStage = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative h-full min-h-[220px] overflow-hidden bg-[#050504] p-5 text-white ${className}`}
  >
    <div className="relative h-full">{children}</div>
  </div>
);

const MiniPhone = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative mx-auto w-[190px] rounded-[34px] bg-[#050504] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.45)] ${className}`}>
    <div className="absolute left-1/2 top-3 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
    <div className="relative aspect-[9/18.8] overflow-hidden rounded-[27px] bg-[var(--m-canvas)]">
      {children}
    </div>
  </div>
);

/* -------------------------- Discovery -------------------------- */

export const SerpStackVisual = () => (
  <GraphiteStage>
    <div className="mx-auto max-w-[420px] pt-2">
      <div className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-[12px] font-semibold text-white/85 backdrop-blur">
        <Search size={14} className="mr-2 inline text-[var(--m-acid)]" />
        events in goa this weekend
      </div>

      <div className="mt-5 rounded-[28px] border border-white/15 bg-white/95 p-4 text-[var(--m-ink-1)] shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
              AI SEO health
            </div>
            <div className="mt-1 text-[42px] font-black leading-none tracking-[-0.06em]">
              94
              <span className="text-[16px] font-semibold text-[var(--m-ink-4)]">/100</span>
            </div>
          </div>
          <div className="relative h-20 w-20 rounded-full border-[10px] border-[var(--m-acid)] bg-[#E8E2D4] p-2">
            <div className="h-full w-full rounded-full bg-white" />
            <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--m-forest-900)]" size={18} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            ["Search result", "37/40"],
            ["Event schema", "22/25"],
            ["City landing page", "19/20"],
          ].map(([label, score]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-[var(--m-canvas-2)] px-3 py-2">
              <span className="text-[12px] font-semibold text-[var(--m-ink-2)]">{label}</span>
              <span className="text-[12px] font-bold text-[var(--m-forest-700)]">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </GraphiteStage>
);

export const MarketplaceCardsVisual = () => (
  <GraphiteStage>
    <div className="relative grid grid-cols-2 gap-3">
      {eventTiles.map((event, idx) => (
        <div
          key={event.name}
          className={`rounded-2xl border border-white/15 bg-white/10 p-2 shadow-xl backdrop-blur transition-transform ${idx % 2 ? "translate-y-5" : ""}`}
        >
          <div className={`relative aspect-[5/3] overflow-hidden rounded-xl ${event.surface}`}>
            <div className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
              LIVE
            </div>
          </div>
          <div className="p-2">
            <div className="hoizr-mark text-[11px] tracking-[0.18em] text-white">
              {event.name.toUpperCase()}
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[9.5px] text-white/70">
              <span>{event.city}</span>
              <span className="font-bold text-[var(--m-acid)]">{event.price}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </GraphiteStage>
);

export const ReviewsVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[var(--m-canvas-2)] p-5">
    <div className="relative mx-auto max-w-[360px] pt-2">
      {[
        ["Thank attendees", "Send 2h after event"],
        ["Ask for public review", "Only after positive reply"],
        ["Route replies", "Inbox + fan profile"],
      ].map(([title, body], idx) => (
        <div
          key={title}
          className="relative mb-3 rounded-[22px] bg-[#FEFCFA] p-4 shadow-[0_14px_38px_rgba(11,11,8,0.12)]"
          style={{ transform: `translateX(${idx * 10}px)` }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--m-forest-900)] text-[var(--m-acid)]">
              {idx + 1}
            </span>
            <div>
              <div className="text-[13px] font-bold text-[var(--m-ink-1)]">{title}</div>
              <div className="text-[11px] text-[var(--m-ink-3)]">{body}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--m-forest-900)] px-3 py-1.5 text-[11px] font-bold text-[var(--m-acid)]">
        <Sparkles size={12} />
        Post-event loop ready
      </div>
    </div>
  </div>
);

export const ListingsVisual = () => (
  <GraphiteStage>
    <div className="mx-auto max-w-[380px] space-y-3 pt-3">
      {[
        ["Google Search", "Synced"],
        ["Maps", "Live"],
        ["Hoizr discovery", "Published"],
        ["City pages", "Rebuilt"],
      ].map(([source, status], idx) => (
        <div
          key={source}
          className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur"
          style={{ transform: `translateX(${idx % 2 ? 18 : 0}px)` }}
        >
          <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
            <MapPin size={13} className="text-[var(--m-acid)]" />
            {source}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10.5px] font-bold text-[var(--m-forest-900)]">
            <CheckCircle2 size={11} /> {status}
          </span>
        </div>
      ))}
    </div>
  </GraphiteStage>
);

export const OrgPageVisual = () => (
  <div className="relative h-full min-h-[240px] overflow-hidden bg-[#ECE5DA] p-5">
    <MiniPhone className="rotate-[-5deg]">
      <div className="h-full bg-white">
        <div className="relative h-32 overflow-hidden bg-[#090807]">
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="text-[10px] font-semibold text-white/75">Best night in Goa</div>
            <div className="text-[20px] font-black leading-none tracking-[-0.04em]">
              Sundown Festival
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-full bg-[var(--m-forest-900)] py-2 text-[10px] font-bold text-white">
              Tickets
            </button>
            <button className="rounded-full border border-[var(--m-border)] py-2 text-[10px] font-bold">
              Lineup
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {["Upcoming shows", "Fan list", "Past highlights"].map((row) => (
              <div key={row} className="rounded-xl bg-[var(--m-canvas-2)] px-3 py-2 text-[10px] font-semibold text-[var(--m-ink-2)]">
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MiniPhone>
  </div>
);

/* -------------------------- Repeat fans -------------------------- */

export const CampaignBuilderVisual = () => (
  <GraphiteStage>
    <div className="mx-auto max-w-[430px] pt-2">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
        <Send size={13} className="text-[var(--m-acid)]" />
        Saturday drop
      </div>
      <div className="mt-4 space-y-3">
        {[
          ["Convert first-timers", "Send launch offer to fans who bought once."],
          ["Bring back old fans", "Target people who missed the last two shows."],
          ["Fill late inventory", "Last-call nudge for warm segments."],
        ].map(([title, body], idx) => (
          <div
            key={title}
            className="rounded-[22px] border border-white/15 bg-white/90 p-4 text-[var(--m-ink-1)] shadow-xl backdrop-blur"
            style={{
              transform: `translateY(${-idx * 4}px) translateX(${idx * 16}px)`,
              opacity: 1 - idx * 0.08,
            }}
          >
            <div className="text-[16px] font-black tracking-[-0.03em]">{title}</div>
            <div className="mt-1 text-[12px] leading-snug text-[var(--m-ink-3)]">{body}</div>
          </div>
        ))}
      </div>
    </div>
  </GraphiteStage>
);

export const WhatsappBubbleVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[#F6EEE1] p-5">
    <div className="relative mx-auto max-w-[360px] pt-4">
      <div className="rounded-[28px] bg-[#FEFCFA] p-4 shadow-[0_20px_48px_rgba(11,11,8,0.14)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--m-forest-900)] text-[var(--m-acid)]">
              <MessageCircle size={20} />
            </span>
            <div>
              <div className="text-[13px] font-black text-[var(--m-ink-1)]">SUNDOWN</div>
              <div className="text-[11px] text-[var(--m-ink-4)]">Just now</div>
            </div>
          </div>
          <span className="rounded-full bg-[var(--m-acid)] px-2.5 py-1 text-[10px] font-black text-[var(--m-forest-900)]">
            Ready
          </span>
        </div>
        <div className="mt-4 text-[15px] font-bold leading-tight text-[var(--m-ink-1)]">
          Phase 1 is live. Send the high-intent fan drop?
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded-full bg-[var(--m-forest-900)] px-4 py-2 text-[11px] font-bold text-white">
            Send
          </button>
          <button className="rounded-full border border-[var(--m-border)] px-4 py-2 text-[11px] font-bold text-[var(--m-ink-2)]">
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const EmailSmsVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[var(--m-canvas-2)] p-5">
    <div className="relative mx-auto max-w-[390px] pt-2">
      {[
        ["Email", "Lineup reveal at 6 PM", "Scheduled"],
        ["SMS", "Doors at 9. Last 12 left.", "Draft"],
        ["Push", "Phase 2 opened automatically", "Live"],
      ].map(([type, copy, state], idx) => (
        <div
          key={type}
          className="mb-3 rounded-[22px] bg-[#FEFCFA] px-4 py-3 shadow-[0_15px_36px_rgba(11,11,8,0.12)]"
          style={{ transform: `translateX(${idx * 12}px)` }}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
              {type}
            </div>
            <span className="rounded-full bg-[var(--m-forest-900)] px-2 py-0.5 text-[9.5px] font-bold text-[var(--m-acid)]">
              {state}
            </span>
          </div>
          <div className="mt-1 text-[14px] font-bold text-[var(--m-ink-1)]">{copy}</div>
        </div>
      ))}
    </div>
  </div>
);

export const LoyaltyVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[var(--m-forest-600)] p-5 text-white">
    <div className="relative mx-auto max-w-[360px] overflow-hidden rounded-[28px] border border-white/25 bg-[#10351F] shadow-xl">
      <img
        src={PARTY_IMAGE}
        alt="Fans at a live party"
        className="h-28 w-full object-cover"
        draggable={false}
      />
      <div className="p-5">
        <div className="text-center text-[13px] font-semibold text-white/86">
          Fan balance
        </div>
        <div className="mt-1 text-center text-[52px] font-black leading-none tracking-[-0.06em]">
          400
          <span className="text-[18px] font-semibold"> pts</span>
        </div>
        <div className="mt-6 rounded-full bg-white px-3 py-3">
          <div className="relative h-2 rounded-full bg-black/10">
            <div className="h-full w-[42%] rounded-full bg-[var(--m-forest-900)]" />
            <div className="absolute left-[42%] top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-white bg-[var(--m-forest-900)] shadow-lg" />
          </div>
        </div>
        <div className="mt-4 flex justify-between text-[11px] font-bold text-white/82">
          <span>100</span>
          <span>400</span>
          <span>1000</span>
        </div>
      </div>
    </div>
  </div>
);

export const PushVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[#050504] p-5 text-white">
    <div className="relative mx-auto flex min-h-[220px] max-w-[380px] flex-col justify-between">
      <div className="relative z-10 rounded-[28px] border border-white/20 bg-white/95 p-4 text-[var(--m-ink-1)] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between">
          <span className="hoizr-mark text-[12px] tracking-[0.18em] text-[var(--m-ink-1)]">HOIZR</span>
          <span className="text-[11px] text-[var(--m-ink-4)]">now</span>
        </div>
        <div className="mt-3 text-[17px] font-black leading-tight tracking-[-0.03em]">
          Headliner reveal is live.
        </div>
        <div className="mt-1 text-[13px] text-[var(--m-ink-3)]">
          Tap to notify fans who saved this genre.
        </div>
      </div>
      <div className="relative mt-7 h-32 overflow-hidden rounded-[30px] border border-white/15 bg-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <img
          src="/marketing/brand/phone-rock-night.png"
          alt="Hoizr Rock Night phone banner"
          className="h-full w-full object-cover object-bottom"
          draggable={false}
        />
      </div>
    </div>
  </div>
);

/* -------------------------- Operations -------------------------- */

export const ScannerVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[#050504] p-5 text-white">
    <div className="mx-auto max-w-[380px] overflow-hidden rounded-[30px] border border-white/15 bg-[#111] shadow-2xl">
      <img
        src={DOOR_IMAGE}
        alt="Live event crowd at the door"
        className="h-28 w-full object-cover"
        draggable={false}
      />
      <div className="relative flex items-center justify-between gap-3 p-4 pb-14 sm:gap-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
            Door team
          </div>
          <div className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em]">
            418
          </div>
          <div className="mt-1 text-[12px] font-semibold text-white/62">
            arrivals checked in
          </div>
        </div>
        <div className="shrink-0 rounded-[20px] bg-white p-3 sm:rounded-[24px] sm:p-4">
          <QrCode
            className="text-[var(--m-ink-1)] h-[56px] w-[56px] sm:h-[82px] sm:w-[82px]"
            strokeWidth={1}
          />
        </div>
        <div className="absolute right-4 top-0 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-[var(--m-acid)] px-3 py-1.5 shadow-lg">
          <CheckCircle2 size={12} className="text-[var(--m-forest-900)]" />
          <span className="text-[11px] font-black text-[var(--m-forest-900)]">Valid entry</span>
        </div>
        <div className="absolute bottom-3 left-4 rounded-2xl border border-white/15 bg-[#050504] px-3 py-2 text-[11px] font-semibold text-white shadow-lg">
          3 scanners online
        </div>
      </div>
    </div>
  </div>
);

export const ReportingVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[var(--m-canvas-2)] p-5">
    <div className="relative rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_48px_rgba(11,11,8,0.1)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--m-ink-3)]">
            <BarChart3 size={16} />
            Ticket revenue
          </div>
          <div className="mt-2 text-[34px] font-black tracking-[-0.06em]">₹12.4L</div>
        </div>
        <span className="rounded-full bg-[#D9F7E6] px-3 py-1 text-[12px] font-black text-[#008A45]">
          ↑ 11%
        </span>
      </div>
      <div className="mt-5 flex h-24 items-end gap-2">
        {[32, 48, 38, 64, 42, 72, 56, 88, 46, 76, 54, 92].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-full ${i % 3 === 0 ? "bg-[var(--m-acid)]" : "bg-[#7FA8FF]"}`}
            style={{ height: `${h}%`, opacity: i % 2 ? 0.72 : 1 }}
          />
        ))}
      </div>
      <div className="mt-5 border-t border-[var(--m-border)] pt-4 text-[12px] font-semibold text-[var(--m-ink-3)]">
        By channel · owned CRM leads 52%
      </div>
    </div>
  </div>
);

export const AutomationsVisual = () => (
  <GraphiteStage>
    <div className="mx-auto max-w-[360px] pt-1">
      {[
        ["New ticket buyer", UsersRound],
        ["Wait 1 day", CalendarDays],
        ["Send offer", Send],
        ["Send reminder", MessageCircle],
      ].map(([label, Icon], idx) => {
        const Lucide = Icon as typeof UsersRound;
        return (
          <div key={label as string} className="relative">
            {idx > 0 ? <div className="mx-auto h-6 w-px bg-white/20" /> : null}
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-[var(--m-acid)]">
                <Lucide size={18} />
              </span>
              <span className="text-[16px] font-black tracking-[-0.03em] text-white">{label as string}</span>
            </div>
          </div>
        );
      })}
    </div>
  </GraphiteStage>
);

export const AiOfferVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[#EF7B24] p-5">
    <div className="relative mx-auto max-w-[380px] pt-2">
      <div className="rounded-[28px] bg-white p-4 shadow-[0_22px_60px_rgba(80,33,0,0.24)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
              AI Offer
            </div>
            <div className="mt-1 text-[18px] font-black text-[var(--m-ink-1)]">Sundown · Goa</div>
          </div>
          <Sparkles size={18} className="text-[var(--m-acid-deep)]" />
        </div>
        <div className="mt-4 space-y-2">
          {[
            ["Aggressive", "₹1,299", "Fastest fill"],
            ["Recommended", "₹1,499", "Best balance", true],
            ["Premium", "₹1,799", "Higher margin"],
          ].map(([band, price, note, on]) => (
            <div
              key={band as string}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${
                on ? "bg-[var(--m-forest-900)] text-white" : "bg-[var(--m-canvas-2)] text-[var(--m-ink-1)]"
              }`}
            >
              <div>
                <div className="text-[12px] font-bold">{band as string}</div>
                <div className={`text-[10px] ${on ? "text-white/60" : "text-[var(--m-ink-4)]"}`}>{note as string}</div>
              </div>
              <div className="text-[15px] font-black">{price as string}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const GuestlistVisual = () => (
  <div className="relative h-full min-h-[220px] overflow-hidden bg-[var(--m-canvas-2)] p-5">
    <div className="relative rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_46px_rgba(11,11,8,0.09)]">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
          Guestlist
        </div>
        <span className="rounded-full bg-[var(--m-forest-900)] px-2.5 py-1 text-[10px] font-bold text-[var(--m-acid)]">
          Live
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-[34px] font-black tracking-[-0.06em]">42</div>
        <div className="text-[12px] font-bold text-[var(--m-ink-4)]">of 60 used</div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[var(--m-border)]">
        <div className="h-full w-[70%] rounded-full bg-[var(--m-acid)]" />
      </div>
      <div className="mt-4 space-y-2">
        {[
          ["Guest A", "Arrived"],
          ["Guest B", "En route"],
          ["Guest C", "Pending"],
        ].map(([name, status]) => (
          <div key={name} className="flex items-center justify-between rounded-xl bg-[var(--m-canvas-2)] px-3 py-2 text-[11px] font-semibold">
            <span>{name}</span>
            <span className={status === "Arrived" ? "text-[#008A45]" : "text-[var(--m-ink-4)]"}>{status}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="relative mt-3 flex items-center gap-1.5 text-[11px] text-[var(--m-ink-3)]">
      <TicketCheck size={12} /> Synced to door scanners
    </div>
  </div>
);
