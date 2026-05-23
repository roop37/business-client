"use client";

import AuthLogo from "@/components/common/auth/AuthLogo";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ArrowRight, Store } from "lucide-react";
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

  return (
    <main className="min-h-screen bg-[#f8efe4] px-6 py-8 text-[#171614]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[720px] flex-col justify-center">
        <AuthLogo width={156} />
        <div className="mt-10">
          <h1 className="text-2xl font-semibold">Select a business</h1>
          <p className="mt-2 text-sm text-[#6f675f]">
            Choose the business you want to manage in this session.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-[#e2d4c3] bg-white">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <FaSpinner className="animate-spin text-primary" size={32} />
            </div>
          ) : hosts.length ? (
            hosts.map((host) => (
              <button
                key={host._id}
                type="button"
                onClick={() => handleSelect(host._id)}
                className="flex w-full items-center justify-between border-b border-[#eee3d6] px-5 py-4 text-left last:border-b-0 hover:bg-[#fbf5ee]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {host.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={host.logo}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f1e5d6] text-[#6f675f]">
                      <Store size={20} />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {host.name || "Untitled business"}
                    </span>
                    <span className="block text-xs text-[#7a7066]">
                      {host.status || "Business account"}
                    </span>
                  </span>
                </span>
                {selectingId === host._id ? (
                  <FaSpinner className="animate-spin text-primary" />
                ) : (
                  <ArrowRight size={18} className="text-[#7a7066]" />
                )}
              </button>
            ))
          ) : (
            <div className="px-5 py-10 text-sm text-[#7a7066]">
              No business accounts are available for this user.
            </div>
          )}
        </section>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
};
