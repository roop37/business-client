"use client";

import AuthLogo from "@/components/common/auth/AuthLogo";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ArrowRight, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

type HostOption = {
  _id: string;
  name?: string | null;
  logo?: string | null;
  status?: string | null;
};

export const SelectHostClient = () => {
  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await sdk.userLogout();
    } catch {
      // Ignore — log out locally even if the server call fails so the
      // user isn't stuck on this page.
    }
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }, []);

  const handleSelect = useCallback(async (hostId: string) => {
    try {
      setSelectingId(hostId);
      await sdk.SetHostIdAsCookie({ hostId });
      const journey = await sdk.MeUserJourney();
      const target =
        journey.meUserJourney.suggestedRoute || "/dashboard";
      // Hard-navigate instead of router.replace. The cookie set by the
      // GraphQL response above must be committed by the browser before
      // the destination page's SSR runs — Next.js soft navigation can
      // dispatch the RSC fetch from a prefetched cache that races the
      // cookie commit, leaving meUserJourney on the dashboard SSR with
      // empty ctx.hostId, which bounces the user right back to
      // /select-host and the click appears to do nothing.
      if (typeof window !== "undefined") {
        window.location.assign(target);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
      setSelectingId("");
    }
  }, []);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        const response = await sdk.getHostsByBusiness();
        const hostList = response.getHostsByBusiness ?? [];
        setHosts(hostList);

        if (hostList.length === 1) {
          await handleSelect(hostList[0]._id);
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, [handleSelect]);

  const initial = (name?: string | null) =>
    (name?.trim()?.[0] || "?").toUpperCase();

  const isActive = (status?: string | null) =>
    (status || "").toLowerCase() === "active";

  return (
    <main className="min-h-screen bg-[#f8efe4] px-6 py-8 text-[#171614]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[560px] flex-col">
        <header className="flex items-center justify-between">
          <AuthLogo width={56} className="opacity-90" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#d9cab4] bg-white/60 px-3.5 py-1.5 text-[12.5px] font-medium text-[#5b4f43] transition hover:border-[#171614] hover:bg-white hover:text-[#171614] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <FaSpinner className="animate-spin" size={12} />
            ) : (
              <LogOut size={13} />
            )}
            Log out
          </button>
        </header>

        <div className="mt-10">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Select a business
          </h1>
          <p className="mt-2 text-[14px] text-[#8a7f74]">
            Choose the business you want to manage in this session.
          </p>
        </div>

        <section className="mt-7 flex flex-1 flex-col gap-2">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <FaSpinner className="animate-spin text-[#8a7f74]" size={22} />
            </div>
          ) : hosts.length ? (
            hosts.map((host) => {
              const active = isActive(host.status);
              const selecting = selectingId === host._id;
              const logo = host.logo?.trim();
              return (
                <button
                  key={host._id}
                  type="button"
                  onClick={() => handleSelect(host._id)}
                  disabled={Boolean(selectingId)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-[#e7d8c2] bg-white/55 px-4 py-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.02)] transition hover:-translate-y-0.5 hover:border-[#171614] hover:bg-white hover:shadow-[0_6px_20px_rgba(43,35,25,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-3.5">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={host.name ? `${host.name} logo` : "Business logo"}
                        // `object-contain` so wide wordmark lockups
                        // display in full; the cream background reads as
                        // a frame around tall/short logos.
                        className="h-12 w-12 shrink-0 rounded-xl bg-[#efe3d2] object-contain"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#171614] text-[15px] font-semibold text-[#f8efe4]">
                        {initial(host.name)}
                      </span>
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[15.5px] font-semibold text-[#171614]">
                          {host.name || "Untitled business"}
                        </span>
                        {active ? (
                          <span
                            aria-label="Active"
                            className="h-2 w-2 shrink-0 rounded-full bg-[#1f9d55]"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 truncate text-[12.5px] text-[#8a7f74]">
                        {active ? "Active workspace" : "Pending setup"}
                      </span>
                    </span>
                  </span>
                  {selecting ? (
                    <FaSpinner className="animate-spin text-[#8a7f74]" size={16} />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="text-[#bcae9c] transition group-hover:translate-x-0.5 group-hover:text-[#171614]"
                    />
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9cab4] bg-white/40 px-4 py-10 text-center text-[13.5px] text-[#8a7f74]">
              No business accounts are available for this user.
            </div>
          )}
        </section>

        {error ? (
          <p className="mt-6 text-[13px] text-[#b3261e]">{error}</p>
        ) : null}
      </div>
    </main>
  );
};
