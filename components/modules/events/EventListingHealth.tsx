import {
  EventEvalResultClient,
  autoGenerateEventDescription,
  runEventEval,
} from "@/utils/eventOfferOps";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react";
import { useState } from "react";

type Props = {
  eventId: string;
  /** Eval data already attached to the event row (saved by Layer 1). */
  initialScore?: number | null;
  initialShortSummary?: string | null;
  initialSpellingMistakes?: EventEvalResultClient["spellingMistakes"] | null;
  initialSeoSuggestions?: EventEvalResultClient["seoSuggestions"] | null;
  /**
   * Called when the host accepts an auto-generated description so the
   * parent form can patch its `description` field. The parent is
   * responsible for the actual server PATCH (via updateEvent).
   */
  onAcceptSuggestedDescription?: (suggestion: string) => void;
};

const severityClass = (
  severity: "Critical" | "High" | "Medium" | "Low"
): string => {
  switch (severity) {
    case "Critical":
      return "border-red-300 bg-red-50 text-red-900";
    case "High":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "Medium":
      return "border-yellow-200 bg-yellow-50 text-yellow-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-800";
  }
};

const EventListingHealth = ({
  eventId,
  initialScore,
  initialShortSummary,
  initialSpellingMistakes,
  initialSeoSuggestions,
  onAcceptSuggestedDescription,
}: Props) => {
  const [score, setScore] = useState<number | null>(initialScore ?? null);
  const [summary, setSummary] = useState<string | null>(
    initialShortSummary ?? null
  );
  const [spelling, setSpelling] = useState(initialSpellingMistakes ?? []);
  const [seo, setSeo] = useState(initialSeoSuggestions ?? []);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const applyEval = (result: EventEvalResultClient) => {
    setScore(result.eventScore);
    setSummary(result.aiShortSummary);
    setSpelling(result.spellingMistakes ?? []);
    setSeo(result.seoSuggestions ?? []);
    if (result.suggestedDescription) {
      setSuggestedDescription(result.suggestedDescription);
    }
  };

  const handleRefresh = async () => {
    setError(null);
    setRefreshing(true);
    try {
      const result = await runEventEval(eventId);
      applyEval(result);
    } catch (e: any) {
      setError(e?.message ?? "Could not run the listing eval.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleAutoGenerate = async () => {
    setError(null);
    setGeneratingDescription(true);
    try {
      const result = await autoGenerateEventDescription(eventId);
      applyEval(result);
      if (!result.suggestedDescription) {
        setError("AI did not return a description this time.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Could not auto-generate the description.");
    } finally {
      setGeneratingDescription(false);
    }
  };

  const scoreBucket =
    score == null
      ? null
      : score >= 75
      ? "Strong"
      : score >= 50
      ? "Okay"
      : "Needs work";

  return (
    <section className="rounded-2xl border border-[var(--owner-border)] bg-white p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--owner-fg-1)]">
            <SparklesIcon size={16} className="text-violet-600" />
            Listing health
          </h3>
          {summary ? (
            <p className="mt-1 max-w-prose text-xs text-[var(--owner-fg-3)]">
              {summary}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
              We use AI to score the listing and surface fixable issues.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {score != null && (
            <div className="rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] px-3 py-1 text-xs">
              <span className="font-semibold text-[var(--owner-fg-1)]">
                {score}/100
              </span>
              <span className="ml-1 text-[var(--owner-fg-3)]">{scoreBucket}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--owner-border)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--owner-fg-1)] hover:bg-[var(--owner-bg-subtle)] disabled:opacity-60"
          >
            <RefreshCwIcon size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--owner-fg-3)]">
            SEO suggestions
          </h4>
          {seo.length === 0 ? (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
              <CheckCircle2Icon size={14} />
              No improvements pending.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {seo.slice(0, 6).map((item, i) => (
                <li
                  key={`${item.field}-${i}`}
                  className={`rounded-md border px-3 py-2 text-xs ${severityClass(item.severity)}`}
                >
                  <div className="font-semibold uppercase tracking-wide text-[10px]">
                    {item.severity} · {item.field}
                  </div>
                  <div className="mt-0.5">{item.suggestion}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--owner-fg-3)]">
            Spelling
          </h4>
          {spelling.length === 0 ? (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
              <CheckCircle2Icon size={14} />
              Nothing flagged.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {spelling.slice(0, 6).map((m, i) => (
                <li
                  key={`${m.field}-${m.word}-${i}`}
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                >
                  <div className="flex items-center gap-1 font-semibold">
                    <AlertTriangleIcon size={12} />
                    {m.field}: <span className="font-mono">{m.word}</span>
                  </div>
                  {m.suggestion && (
                    <div className="mt-0.5">
                      Suggestion: <span className="font-mono">{m.suggestion}</span>
                    </div>
                  )}
                  {m.context && (
                    <div className="mt-0.5 text-[11px] text-amber-800/80">
                      “{m.context}”
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--owner-border)] pt-3">
        <button
          type="button"
          onClick={handleAutoGenerate}
          disabled={generatingDescription}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--owner-fg-1)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <SparklesIcon size={14} />
          {generatingDescription
            ? "Drafting…"
            : "Auto-generate description draft"}
        </button>
        {suggestedDescription && (
          <div className="flex w-full flex-col gap-2 rounded-md border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
            <div className="font-semibold">AI-drafted description</div>
            <p className="whitespace-pre-wrap leading-relaxed">
              {suggestedDescription}
            </p>
            {onAcceptSuggestedDescription && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md bg-violet-700 px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                  onClick={() => {
                    onAcceptSuggestedDescription(suggestedDescription);
                    setSuggestedDescription(null);
                  }}
                >
                  Use this draft
                </button>
                <button
                  type="button"
                  className="rounded-md border border-violet-300 px-3 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-100"
                  onClick={() => setSuggestedDescription(null)}
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventListingHealth;
