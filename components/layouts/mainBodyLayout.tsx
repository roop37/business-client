"use client";

import { WalkthroughKey } from "@/generated/graphql";
import useAuthStore from "@/store/auth";
import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import useHostsStore from "@/store/host";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, sanitizeText } from "@/utils/utilFUncs";
import { ArrowRightIcon, StoreIcon } from "lucide-react";
import {
  Figtree,
  Karla,
  Libre_Caslon_Display,
  Tenor_Sans,
} from "next/font/google";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import Joyride, { STATUS } from "react-joyride";
import CButton from "../common/button/button";
import { ButtonType } from "../common/button/interface";
import ReusableModal from "../common/modal/modal";
import CustomJoyrideTooltip from "../joyride";
import Loader from "../loader";
import Navbar from "../navbar/navbar";
import AppSidebar from "../navigation/sidebar";
import { SidebarProvider } from "../ui/sidebar";

// Website Builder Fonts
const karla = Karla({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const figtree = Figtree({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const libre = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
});

const tenor = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tenor",
  display: "swap",
});

const isWalkthroughCompleted = (
  completed: WalkthroughKey[] | undefined,
  key: WalkthroughKey
) => (completed ?? []).includes(key);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Configs
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [initialTaxRateNotAddedFormStates] = useState({
    name: "",
    salesTax: "",
    default: false,
  });
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("Add");
  const [loading, setLoading] = useState(true);
  const [existingTaxRateId, setExistingTaxRateId] = useState<string | null>(
    null
  );

  // Global and Local States
  const { control, handleSubmit, getValues, setValue, reset } = useForm({
    defaultValues: {
      name: "",
      salesTax: "",
      default: false,
    },
  });

  const { meUser } = useUserStore();
  const { isShowTaxSettings, setIsShowTaxSettings } = useGlobalStore();
  const {
    setHosts,
    setSelectedHost,
    setSelectedHostTaxRateId,
    setSelectedHostId,
    setSelectedHostType,
    setHostLogo,
    setHostAddress,
    setHostEmail,
    setHostPhone,
    setFacebookLink,
    setInstagramLink,
    setGoogleMapsLink,
    setTimezone,
  } = useHostsStore();
  const { setTaxRate, taxRate } = useAuthStore();
  const { setMasterStates, setMasterTimezones, setCuisinesOptions } =
    useMasterStore();
  const {
    setEmail,
    setFirstName,
    setLastName,
    setPhone,
    setStatus,
    setUserId,
  } = useAuthStore();
  const {
    multiAccountModal,
    showMultiAccountModal,
    setToastData,
    setShowMultiAccount,
  } = useGlobalStore();

  const [multiAccountLoading, setMultiAccountLoading] = useState(false);
  const [multiAccounts, setMultiAccounts] = useState<
    { _id: string; businessName: string }[]
  >([]);

  // Handler Functions
  const handleCloseTaxSettings = () => {
    if (!taxRate?.id) {
      reset();
    }
    // reset();
    setIsShowTaxSettings(false);
  };

  const onSubmit = async (data: {
    name: string;
    salesTax: string;
    default: boolean;
  }) => {
    try {
      const currentFormValues = getValues();
      if (sanitizeText(data.name).length > 20) {
        setToastData({
          message: "Tax rate name should be of maximum 20 characters",
          type: "error",
        });
        return;
      }
      const changedData: {
        _id: string;
        name?: string;
        salesTax?: number;
      } = {
        _id: existingTaxRateId ?? "",
        name: sanitizeText(currentFormValues.name),
        salesTax: Number(parseFloat(currentFormValues.salesTax).toFixed(2)),
      };
      const hasChanges = Object.keys(changedData).length > 1;

      if (existingTaxRateId && hasChanges) {
        const res = await sdk.updateTaxRate({ input: changedData });

        if (res.updateTaxRate) {
          setToastData({
            message: "Tax rate updated successfully!",
            type: "success",
          });
        } else {
          setToastData({
            message: "Something went wrong",
            type: "error",
          });
        }
      } else if (!existingTaxRateId) {
        setButtonTitle("Add");
        const taxRateInput = {
          name: sanitizeText(data.name),
          salesTax: parseFloat(data.salesTax),
        };

        const taxRateResponse = await sdk.addTaxRate({ input: taxRateInput });
        if (taxRateResponse.addTaxRate) {
          setSelectedHostTaxRateId(taxRateResponse?.addTaxRate);
          setToastData({
            message: "Tax rate added successfully!",
            type: "success",
          });
        } else {
          setToastData({
            message: "Something went wrong",
            type: "error",
          });
        }
      }

      setIsSaveButtonEnabled(false);

      fetchUserRestaurants(true);
      setIsShowTaxSettings(false);
    } catch (error) {
      console.error("Error submitting tax rate:", error);
      setToastData({ message: extractErrorMessage(error), type: "error" });
    }
  };

  const fetchUserDetails = useCallback(async (force = false) => {
    if (!force && useUserStore.getState().meUser?._id) {
      return;
    }
    try {
      const response = await sdk.MeUser();
      if (response?.meUser) {
        const {
          _id,
          firstName,
          lastName,
          status,
          email,
          phone,
          permissions,
          role,
          completedWalkthroughs,
        } = response.meUser;
        useUserStore.getState().setMeUser({
          _id,
          firstName,
          lastName,
          status,
          email,
          phone,
          permissions,
          role,
          completedWalkthroughs: completedWalkthroughs ?? [],
        });
        const auth = useAuthStore.getState();
        auth.setUserId(_id ?? "");
        auth.setEmail(email ?? "");
        auth.setPhone(phone ?? "");
        auth.setFirstName(firstName ?? "");
        auth.setLastName(lastName ?? "");
        auth.setStatus(status ?? "");
        setShowWalkthrough(
          !isWalkthroughCompleted(completedWalkthroughs, WalkthroughKey.Main)
        );
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  }, []);

  const fetchUserRestaurants = useCallback(async (force = false) => {
    if (!force && useHostsStore.getState().hosts.length > 0) {
      return;
    }
    try {
      const response = await sdk.userRestaurants();
      if (response?.userRestaurants) {
        const formattedHosts = response.userRestaurants.map((res) => ({
          ...res,
          id: res.id ?? res._id,
        }));
        setHosts(formattedHosts);

        try {
          const res = await sdk.restaurantDetails();
          if (res?.restaurantDetails) {
            const {
              name,
              _id,
              logo,
              address,
              email,
              phone,
              hostType,
            } = res.restaurantDetails;

            setSelectedHost(name || "");
            setHostLogo(logo || "");
            if (address) {
              setHostAddress({ ...address, _id: address._id || "" });
            }

            setSelectedHostId(_id || "");
            setSelectedHostType(hostType ?? null);

            setHostEmail(email || "");
            setHostPhone(phone || "");
            setInstagramLink("");
            setFacebookLink("");
            setGoogleMapsLink("");
            setTimezone("");
            setExistingTaxRateId(null);
            setButtonTitle("Add");
          } else {
            try {
              const res = await sdk.setRestaurantIdAsCookie({
                id: formattedHosts[0]?.id,
              });
              if (res) {
                setSelectedHost(formattedHosts[0]?.name || "");
              }
            } catch (error) {
              console.error("Failed to set host cookie:", error);
            }
          }
        } catch (error) {
          await sdk.setRestaurantIdAsCookie({
            id: formattedHosts[0]?.id,
          });
          setSelectedHost(formattedHosts[0]?.name || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch business accounts:", error);
    }
  }, []);
  // Use Effect
  useEffect(() => {
    setLoading(true);
    if (meUser?._id) {
      setShowWalkthrough(
        !isWalkthroughCompleted(meUser.completedWalkthroughs, WalkthroughKey.Main)
      );
      setLoading(false);
    } else {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [meUser]);

  useEffect(() => {
    fetchUserDetails();
    fetchUserRestaurants();
    setLoading(false);
    // Mount-only: MainLayout persists across routes (getLayout pattern),
    // so these fetches should fire exactly once per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const masters = useMasterStore.getState();
    if (
      masters.statesOptions.length > 0 &&
      masters.timezonesOptions.length > 0 &&
      masters.cuisinesOptions.length > 0
    ) {
      return;
    }
    const fetchMasterData = async () => {
      try {
        const resstates = await sdk.getActiveStates();
        if (resstates && resstates.getActiveStates) {
          const formattedStates = resstates.getActiveStates.map(
            (state: { value: string; _id: string }) => ({
              value: state._id,
              label: state.value,
            })
          );
          setMasterStates(formattedStates);
        }
        const resTimeZones = await sdk.getActiveTimezones();
        if (resTimeZones && resTimeZones.getActiveTimezones) {
          const formattedTimeZones = resTimeZones.getActiveTimezones.map(
            (timeZone: { gmtOffset: number; value: string; _id: string }) => {
              const gmtOffsetHours = timeZone.gmtOffset / 3600;
              const sign = gmtOffsetHours >= 0 ? "+" : "-";
              const formattedLabel = `${timeZone.value} (GMT ${sign} ${Math.abs(
                gmtOffsetHours
              )})`;
              return {
                value: timeZone._id,
                label: formattedLabel,
              };
            }
          );
          setMasterTimezones(formattedTimeZones);
        }

        const resCuisines = await sdk.getActiveCuisines();
        if (resCuisines && resCuisines.getActiveCuisines) {
          const formattedCuisines = resCuisines.getActiveCuisines
            .map((cuisine: { value: string; _id: string }) => ({
              id: cuisine._id,
              value: cuisine.value,
            }))
            .sort((a, b) => a.value.localeCompare(b.value));

          setCuisinesOptions(formattedCuisines);
        }
      } catch (error) {
        console.error("Failed to fetch master data:", error);
      }
    };

    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { isMultiAccountUser } = await sdk.IsMultiAccountUser();

        setShowMultiAccount(isMultiAccountUser);
      } catch (error) {
        console.error("Failed to fetch business users:", error);
      }
    };
    fetchFunc();
  }, []);

  useEffect(() => {
    const fetchFunc = async () => {
      try {
        setMultiAccountLoading(true);
        const { getHostsByBusiness } = await sdk.getHostsByBusiness();

        if (!getHostsByBusiness) {
          setToastData({
            type: "error",
            message: "An unknown error occured, please try again later",
          });
          return;
        }

        setMultiAccounts(
          getHostsByBusiness.map((e) => ({
            _id: e._id.toString(),
            businessName: e.name ?? "Untitled business",
          }))
        );
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        setToastData({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setMultiAccountLoading(false);
      }
    };

    if (multiAccountModal) {
      fetchFunc();
    } else {
      setMultiAccountLoading(false);
      setMultiAccounts([]);
    }
  }, [multiAccountModal]);

  const handleAccountSelect = async (id: string) => {
    try {
      setMultiAccountLoading(true);

      const { setHostIdAsCookie } = await sdk.SetHostIdAsCookie({
        hostId: id,
      });

      if (!setHostIdAsCookie) {
        setToastData({
          type: "error",
          message: "An unknown error occured, please try again later",
        });
        return;
      }

      showMultiAccountModal(false);
      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setMultiAccountLoading(false);
    }
  };

  const handleInputChange = () => {
    const currentFormValues = getValues();
    const isFieldsEmpty =
      currentFormValues.name.trim() === "" &&
      currentFormValues.salesTax.trim() === "";

    if (isFieldsEmpty) {
      setIsSaveButtonEnabled(false);
      return;
    }

    if (existingTaxRateId) {
      // If there's an existing tax rate, compare with current values
      const hasChanges =
        currentFormValues.name.trim() !== taxRate?.name?.trim() ||
        currentFormValues.salesTax !== taxRate?.salesTax?.toString();
      setIsSaveButtonEnabled(hasChanges);
    } else {
      // For new tax rates, enable if both fields have values
      const hasValues =
        currentFormValues.name.trim() !== "" &&
        currentFormValues.salesTax.trim() !== "";
      setIsSaveButtonEnabled(hasValues);
    }
  };

  useEffect(() => {
    if (!loading) {
    }
  }, [loading]);

  if (loading) {
    return <Loader />;
  }

  return (
    <SidebarProvider className="min-w-0 overflow-hidden">
      <Joyride
        steps={[
          {
            title: "Welcome to Hoizr",
            content:
              "Let's walk through the places you will use most to create events, sell tickets, run campaigns, and manage payouts.",
            placement: "center",
            target: "body",
          },
          {
            title: "Sidebar",
            content:
              "Use the sidebar to move between operations, marketing, ticket sales, customer data, and payments.",
            target: "#app-sidebar",
            placement: "right",
          },
          {
            title: "Dashboard",
            content:
              "Start here for event performance, ticket sales, upcoming events, and recent activity.",
            target: "#sidebar-dashboard",
            placement: "right",
          },
          {
            title: "Events",
            content:
              "Create and manage event drafts, ticketing, collaborators, lineup, and publishing.",
            target: "#sidebar-events",
            placement: "right",
          },
          {
            title: "Campaigns",
            content:
              "Create campaigns, manage saved campaigns, and track metrics from your marketing activity.",
            target: "#sidebar-campaigns",
            placement: "right",
          },
          {
            title: "Rewards and Loyalties",
            content:
              "Configure loyalty settings and offers for customers who keep coming back.",
            target: "#sidebar-rewards",
            placement: "right",
          },
          {
            title: "Customers",
            content:
              "View customer profiles, segments, and purchase behavior for future campaigns.",
            target: "#sidebar-customers",
            placement: "right",
          },
          {
            title: "Ticket Sales",
            content:
              "Track ticket purchases, guestlist entries, and sales activity for your events.",
            target: "#sidebar-ticket-sales",
            placement: "right",
          },
          {
            title: "Payment",
            content:
              "Add payout profiles and review settlement details for paid events.",
            target: "#sidebar-payment",
            placement: "right",
          },
          {
            title: "Account Settings",
            content:
              "Use the account menu for profile, business, and workspace controls.",
            target: "#nav-account-management",
            placement: "bottom",
          },
        ]}
        run={showWalkthrough && !loading}
        continuous
        disableScrollParentFix
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        hideCloseButton={true}
        callback={async (data) => {
          const { status } = data;
          const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

          if (finishedStatuses.includes(status) && meUser) {
            setShowWalkthrough(false);
            useUserStore
              .getState()
              .markWalkthroughCompleteLocal(WalkthroughKey.Main);
            try {
              await sdk.MarkWalkthroughDone({
                input: { walkthrough: WalkthroughKey.Main },
              });
            } catch (error) {
              console.error("Failed to persist walkthrough:", error);
            }
          }
        }}
        tooltipComponent={CustomJoyrideTooltip}
      />

      <AppSidebar />

      {/* Owner shell: floating glass sidebar + clipped white canvas. */}
      <div
        className={`flex h-[100dvh] min-w-0 flex-1 flex-col overflow-x-hidden bg-[linear-gradient(135deg,#f6efe5_0%,#edf3fb_54%,#fbf7ee_100%)] font-owner ${karla.variable} ${tenor.variable} ${libre.variable} ${figtree.variable}`}
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden border border-white/70 bg-owner-bg/95 shadow-[0_18px_60px_rgba(43,35,25,0.10)] backdrop-blur-xl md:my-2 md:mr-2 md:rounded-[24px]"
        >
          <Navbar />
          <div
            className="min-h-0 w-full min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-7 lg:px-10 lg:py-9"
          >
            <div className="mx-auto w-full max-w-[1200px]">{children}</div>
          </div>
        </div>
      </div>

      <ReusableModal
        title="Tax Rate"
        isOpen={isShowTaxSettings}
        onClose={handleCloseTaxSettings}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block mb-2 text-sm font-medium text-left text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Enter name"
                  id="name"
                  className="input input-primary"
                  onChange={(e) => {
                    let input = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Remove any non-alphabet characters
                    setValue("name", input);
                    // setFirstName(input);
                    // field.onChange(e);
                    handleInputChange();
                  }}
                />
              )}
            />
          </div>

          <div className="mb-4">
            <label
              className="block mb-2 text-sm font-medium text-left text-gray-700"
              htmlFor="salesTax"
            >
              Sales Tax
            </label>
            <div className="relative">
              <Controller
                name="salesTax"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="salesTax"
                    type="number"
                    placeholder="Enter Sales Tax"
                    className="input input-primary pr-10"
                    onChange={(e) => {
                      let input = e.target.value;
                      if (input.toString().length > 4) {
                        input = input.slice(0, 4);
                      }

                      const numVal = Number(input);
                      if (numVal <= 100) {
                        field.onChange(input);
                        handleInputChange();
                      }
                    }}
                    step="0.01"
                    onWheel={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if (e.key === "e" || e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      }
                    }}
                    onFocus={(e) =>
                      e.target.addEventListener("wheel", (event) =>
                        event.preventDefault()
                      )
                    }
                  />
                )}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
          </div>

          <div className="flex items-center ">
            <CButton
              variant={ButtonType.Primary}
              type="submit"
              className="w-full"
              disabled={!isSaveButtonEnabled}
            >
              {buttonTitle}
            </CButton>
          </div>
        </form>
      </ReusableModal>

      {/* PayoutPromptModal + AddPayoutModal now live globally in
          _app.tsx (Pages Router) and AppGlobals.tsx (App Router) so
          routes that don't wrap with MainLayout (e.g. EventJourney)
          can still surface them. */}

      <ReusableModal
        isOpen={multiAccountModal}
        onClose={() => showMultiAccountModal(false)}
        title={"Choose a business to manage"}
        width="md"
      >
        {multiAccountLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin text-gray-500">
              <FaSpinner className="text-primary" size={39} />
            </div>
          </div>
        ) : (
          <div className="py-4">
            {multiAccounts.map((e) => (
              <div
                key={e._id}
                className={`flex justify-between items-center w-full p-4 border-b last:border-none hover:bg-gray-100 hover:rounded-xl cursor-pointer`}
                onClick={() => {
                  handleAccountSelect(e._id);
                }}
              >
                <div className="flex justify-between items-center w-full space-x-4">
                  <div className="flex justify-start items-center w-full space-x-4">
                    <StoreIcon
                      size={32}
                      className="bg-background text-blackBg/40 p-2 rounded-xl"
                    />
                    <div className="flex flex-col justify-start items-start">
                      <h4 className="font-semibold text-sm text-blackBg">
                        {e.businessName}
                      </h4>
                      <p className="font-normal text-xs text-blackBg/60">
                        Click to manage this business
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon
                    size={32}
                    className="bg-background text-blackBg/40 p-2 rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ReusableModal>

    </SidebarProvider>
  );
};

export default MainLayout;
