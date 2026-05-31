"use client";

import AuthLogo from "@/components/common/auth/AuthLogo";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

type HostOption = {
  _id: string;
  name?: string | null;
  logo?: string | null;
  status?: string | null;
};

export const SelectHostClient = () => {
  const router = useRouter();
  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");

  const handleSelect = useCallback(
    async (hostId: string) => {
      try {
        setSelectingId(hostId);
        await sdk.SetHostIdAsCookie({ hostId });
        const journey = await sdk.MeUserJourney();
        router.replace(journey.meUserJourney.suggestedRoute || "/dashboard");
      } catch (err) {
        setError(extractErrorMessage(err));
        setSelectingId("");
      }
    },
    [router]
  );

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
    <main className="min-h-screen bg-[#f8efe4] px-6 py-10 text-[#171614]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[480px] flex-col justify-center">
        <AuthLogo width={88} className="opacity-90" />

        <div className="mt-12">
          <h1 className="text-[22px] font-medium leading-tight tracking-tight">
            Select a business
          </h1>
          <p className="mt-1.5 text-[13px] text-[#8a7f74]">
            Choose the business you want to manage in this session.
          </p>
        </div>

        <section className="mt-8 flex flex-col gap-1">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <FaSpinner className="animate-spin text-[#8a7f74]" size={20} />
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
                  className="group flex w-full items-center justify-between rounded-md px-3 py-3 text-left transition hover:bg-[#efe3d2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={host.name ? `${host.name} logo` : "Business logo"}
                        className="h-9 w-9 shrink-0 rounded-md bg-[#efe3d2] object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171614] text-[12px] font-medium text-[#f8efe4]">
                        {initial(host.name)}
                      </span>
                    )}
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[14px] font-medium text-[#171614]">
                        {host.name || "Untitled business"}
                      </span>
                      {active ? (
                        <span
                          aria-label="Active"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f9d55]"
                        />
                      ) : null}
                    </span>
                  </span>
                  {selecting ? (
                    <FaSpinner className="animate-spin text-[#8a7f74]" size={14} />
                  ) : (
                    <ArrowRight
                      size={16}
                      className="text-[#bcae9c] transition group-hover:translate-x-0.5 group-hover:text-[#171614]"
                    />
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-md px-3 py-8 text-center text-[13px] text-[#8a7f74]">
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
