import {
  CustomCampaignFilter,
  CustomEmailTargetType,
  EmailCampaignPublicationStatus,
  EmailCampaignScheduleTypes,
  UpdateResEmailCampaignInput,
} from "@/generated/graphql";
import useAuthStore from "@/store/auth";
import { default as useCampaignStore } from "@/store/customCampaignStore";
import useGlobalStore from "@/store/global";
import useOriginalCampaignStore from "@/store/originalCampaignStore";
import useHostsStore from "@/store/host";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import { sdk } from "@/utils/graphqlClient";
import {
  convertApiCustomFiltersToConditionGroup,
  convertCustomFilterToInput,
  extractErrorMessage,
} from "@/utils/utilFUncs";
import { isBefore } from "date-fns";
import { useRouter } from "next/router";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import CButton from "../common/button/button";
import { ButtonType } from "../common/button/interface";
import EmailTemplatePreview from "../common/emailTemplatePreview/emailTemplatePreview";
import ReusableModal from "../common/modal/modal";
import { DateTime } from "luxon";

function getLuminance(hex: string): number {
  const rgb = hex
    .replace("#", "")
    .match(/.{1,2}/g)
    ?.map((val) => parseInt(val, 16)) || [0, 0, 0];
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(bgColor: string, textColor: string): number {
  const bgLuminance = getLuminance(bgColor);
  const textLuminance = getLuminance(textColor);
  return (
    (Math.max(bgLuminance, textLuminance) + 0.05) /
    (Math.min(bgLuminance, textLuminance) + 0.05)
  );
}

function isContrastOkay(
  bgColor: string,
  textColor: string,
  largeText: boolean = false
): boolean {
  const contrastRatio = getContrastRatio(bgColor, textColor);
  const minimumContrast = largeText ? 3.0 : 4.5;
  return contrastRatio >= minimumContrast;
}
import {
  CampaignCsvRowType,
  sanitizeData,
  validateEmail,
  validateName,
  validatePhone,
} from "@/utils/campaignCSVHelpler";
import { DEFAULT_ROOT_GROUP } from "../modules/campaignOnboarding/customFilterBuilder";
import { useSearchParams } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const steps = [
  { title: "Set Up Your Campaign", link: "template-select" },
  { title: "Email Editor", link: "template-edit" },
  { title: "Audience", link: "template-target" },
  { title: "When to send it?", link: "schedule" },
];

const OnboardingCampaignLayout = ({ children }: Props) => {
  const router = useRouter();
  const { query } = router;
  const { campaignOnboardingRoute } = query;
  const { setToastData, showHostUnderReviewModal } = useGlobalStore();
  const hideBackButtonPaths = "template-edit";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const { editId, isEdit } = router.query;
  const eventId =
    typeof router.query.eventId === "string" ? router.query.eventId : undefined;
  const searchParams = useSearchParams();
  const isDuplicate = (searchParams?.get("isDuplicate") ?? false) as boolean;

  const {
    campaignTitle,
    campaignSubject,
    designJson,
    html,
    content,
    targetType,
    selectedFilters,
    processedCSVRows,
    scheduleType,
    scheduleDate,
    campaignId,
    resetCampaignState,
    targetCount,
    ctaLink,
    setCtaLink,
    setHostOnlineOrderingLink,
    setHostPrimaryColor,
    setHostBackgroundColor,
    customFilterConditions,
    emailStatus,
  } = useCampaignStore();

  const { setSelectedHost, setHostLogo, setHostAddress } =
    useHostsStore();

  const hidePreviewTemplate = !(
    hideBackButtonPaths === campaignOnboardingRoute
  );
  const { timezone } = useHostsStore();
  const hostTz = timezone?.split(" ")[0] ?? "";
  const getQueryString = () => searchParams?.toString() ?? "";
  const validateCampaignCreation = () => {
    // Validation for Template Select step
    if (!campaignTitle || !campaignSubject || !designJson) {
      setToastData({
        type: "error",
        message: "Please enter all the required details for the campaign.",
      });
      const queryString = getQueryString();
      router.push(`/campaigns/onboarding/template-select?${queryString}`);
      return false;
    }

    // Validation for Template Target step
    if (!targetType) {
      setToastData({
        type: "error",
        message: "Please select an audience target.",
      });
      const queryString = getQueryString();
      router.push(`/campaigns/onboarding/template-target?${queryString}`);
      return false;
    }

    // Specific validations for different target types
    switch (targetType) {
      case CustomEmailTargetType.Csv:
        if (!processedCSVRows || processedCSVRows.length < 1) {
          setToastData({
            type: "error",
            message: "Please upload a valid CSV file",
          });
          const queryString = getQueryString();

          router.push(`/campaigns/onboarding/template-target?${queryString}`);
          return false;
        }
        break;

      case CustomEmailTargetType.CustomCustomer:
        if (!eventId) {
          setToastData({
            type: "error",
            message: "Open this campaign from an event to target that event.",
          });
          const queryString = getQueryString();

          router.push(`/campaigns/onboarding/template-target?${queryString}`);
          return false;
        }
        break;
    }

    // Validation for Schedule step
    if (!scheduleType) {
      setToastData({
        type: "error",
        message: "Please select a schedule type",
      });
      const queryString = getQueryString();

      router.push(`/campaigns/onboarding/schedule?${queryString}`);
      return false;
    }

    // Additional validation for scheduled campaigns
    if (scheduleType === EmailCampaignScheduleTypes.Later && !scheduleDate) {
      setToastData({
        type: "error",
        message: "Please select a schedule date",
      });
      const queryString = getQueryString();

      router.push(`/campaigns/onboarding/schedule?${queryString}`);
      return false;
    }

    if (scheduleDate && isBefore(scheduleDate, new Date())) {
      setToastData({
        type: "error",
        message: "Please select a future schedule",
      });
      const queryString = getQueryString();

      router.push(`/campaigns/onboarding/schedule?${queryString}`);
      return false;
    }

    return true;
  };

  const handleBackClick = () => {
    if (campaignOnboardingRoute === "template-select") {
      router.push("/campaigns/email");
    } else if (campaignOnboardingRoute === "template-edit") {
      const queryString = getQueryString();
      router.push(`/campaigns/onboarding/template-select?${queryString}`);
    } else {
      router.back();
    }
  }; // if campaign id alredy exist is present then append it into the query in the else part

  const currentStepIndex = steps.findIndex(
    (step) => step.link === campaignOnboardingRoute
  );

  const { userId } = useAuthStore();
  const { selectedHostId } = useHostsStore();

  // Hard ceiling on CSV upload size. Cloudinary's free-tier raw quota
  // and our recipient-list semantics both make >5MB a footgun (it
  // implies hundreds of thousands of rows = blast-radius the sender
  // doesn't actually want to take in one campaign). The preset itself
  // also caps at 10MB; this guard fails fast with a friendly message
  // before the network round-trip.
  const MAX_CSV_BYTES = 5 * 1024 * 1024;

  const uploadValidCsvToCloudinary = async (
    csvData: string
  ): Promise<string | undefined> => {
    if (!selectedHostId) {
      throw new Error("Host context is still loading, retry in a moment.");
    }

    const blob = new Blob([csvData], { type: "text/csv" });
    if (blob.size > MAX_CSV_BYTES) {
      throw new Error(
        `Recipient CSV is too large (${(blob.size / 1024 / 1024).toFixed(
          1
        )}MB). Keep it under 5MB or split into multiple campaigns.`
      );
    }

    // Stamp the blob with a host_user_ts filename so concurrent
    // uploads from the same host never collide on the public_id
    // Cloudinary auto-assigns.
    const fileName = `${selectedHostId}_${userId}_${Date.now()}.csv`;
    const file = new File([blob], fileName, { type: "text/csv" });

    // Upload only. Cleanup of the previous CSV is the caller's job
    // and must run AFTER the campaign save commits — otherwise the
    // backend's "still referenced" check trips and the destroy is
    // skipped. See the call-site in goToNextStep for the full flow.
    const result = await uploadHostAsset({
      kind: "campaign-csv",
      hostId: selectedHostId,
      file,
      resourceType: "raw",
    });
    return result.secureUrl;
  };

  const handleCSVUpload = async (
    rows: any[] | null
  ): Promise<string | null> => {
    if (!rows || rows.length === 0) return null;
    const csv = Papa.unparse(rows, { header: true });
    const uploaded = await uploadValidCsvToCloudinary(csv);
    return uploaded ?? null;
  };

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const res = await sdk.restaurantDetails();
        if (res?.restaurantDetails) {
          const { name, brandingLogo, address } = res.restaurantDetails;

          setSelectedHost(name || "");
          setHostLogo(brandingLogo || "");
          if (address) {
            setHostAddress({ ...address, _id: address._id || "" });
          }
        }
      } catch (error) {
        console.error("Failed to fetch host details:", error);
      }
    };

    fetchRestaurantDetails();
  }, []);

  useEffect(() => {
    if (isDuplicate || !editId || typeof editId !== "string") return;

    async function fetchCampaigns() {
      const response = await sdk.fetchRestaurantCampaignById({
        id: editId as string,
      });
      if (response?.fetchRestaurantCampaignById) {
        const campaign = response.fetchRestaurantCampaignById;

        if (
          campaign.target === CustomEmailTargetType.Csv &&
          campaign.csvDataUrl
        ) {
          try {
            // Fetch the CSV file from the URL
            const csvResponse = await fetch(campaign.csvDataUrl);
            const csvBlob = await csvResponse.blob();
            const csvFile = new File([csvBlob], "campaign-csv.csv", {
              type: "text/csv",
            });
            // Use the same processing logic as in processCsvData
            const requiredHeaders = ["email", "name"];
            const optionalHeaders = ["phone"];
            const allHeaders = [...requiredHeaders, ...optionalHeaders];

            Papa.parse<CampaignCsvRowType>(csvFile, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const validRows: CampaignCsvRowType[] = [];
                const processErrors: string[] = [];

                // Check headers
                const headers = Object.keys(results.data[0] || {});
                const isHeaderValid =
                  headers.length === allHeaders.length &&
                  headers.every(
                    (header, index) =>
                      header.toLowerCase() === allHeaders[index]
                  );

                if (!isHeaderValid) {
                  setToastData({
                    type: "error",
                    message:
                      "CSV headers are incorrect or not in the expected order.",
                  });
                  return;
                }

                results.data.forEach((row, index) => {
                  let rowError = false;

                  // Validate required fields
                  if (!row.email || !row["name"]) {
                    processErrors.push(
                      `Row ${index + 1}: Missing required fields`
                    );
                    rowError = true;
                  }

                  // Validate email
                  if (!rowError && !validateEmail(row.email)) {
                    processErrors.push(
                      `Row ${index + 1}: Invalid email format`
                    );
                    rowError = true;
                  }

                  // Validate names
                  if (!rowError && !validateName(row["name"])) {
                    processErrors.push(`Row ${index + 1}: Invalid name format`);
                    rowError = true;
                  }

                  // Validate optional fields
                  if (!rowError && !validatePhone(row.phone || "")) {
                    processErrors.push(
                      `Row ${index + 1}: Invalid phone number`
                    );
                    rowError = true;
                  }

                  // If no errors, sanitize and add to valid rows
                  if (!rowError) {
                    validRows.push(sanitizeData(row));
                  }
                });

                // Set processed CSV rows in the store
                useCampaignStore.getState().setProcessedCSVRows(validRows);
                useOriginalCampaignStore
                  .getState()
                  .setProcessedCSVRows(validRows);

                // If there are errors, show toast
                if (processErrors.length > 0) {
                  setToastData({
                    type: "warning",
                    message: `CSV processing completed with ${processErrors.length} errors.`,
                  });
                }
              },
              error: (error) => {
                console.error("CSV Parsing Error:", error);
                setToastData({
                  type: "error",
                  message: "Error parsing CSV file",
                });
              },
            });
          } catch (csvFetchError) {
            console.error("Error fetching CSV:", csvFetchError);
            setToastData({
              type: "error",
              message: "Could not fetch CSV file",
            });
          }
        }

        const conditionGroup = campaign.customFilters
          ? convertApiCustomFiltersToConditionGroup(
              campaign.customFilters as any
            )
          : DEFAULT_ROOT_GROUP;

        useCampaignStore.setState({
          campaignId: editId as string,
          selectedTemplate: campaign.emailTemplate?.content ?? "",
          designJson: campaign.emailTemplate?.designJson ?? "",
          html: campaign.emailTemplate?.html ?? "",
          content: campaign.emailTemplate?.content ?? "",
          campaignTitle: campaign.campaignName ?? "",
          campaignSubject: campaign.emailSubject ?? "",
          targetType: campaign.target ?? CustomEmailTargetType.AllCustomer,
          selectedFilters: campaign.filters ?? null,
          scheduleType: campaign.scheduleType ?? EmailCampaignScheduleTypes.Now,
          scheduleDate: campaign.scheduleTime
            ? new Date(campaign.scheduleTime)
            : null,
          targetCount: campaign.targetCount ?? 0,
          customFilterConditions: conditionGroup,
          emailStatus:
            campaign.emailStatus ?? EmailCampaignPublicationStatus.Drafted,
          // Without seeding csvUrl, the save path at the publish step
          // hits the "CSV rows unchanged" branch and writes
          // `input.csvDataUrl = currentState.csvUrl` — which is "" by
          // default — clearing the stored URL on the backend and
          // failing activation with "CSV URL is required for CSV
          // target type." Seed it from the loaded campaign so the
          // duplicate-then-publish flow keeps the original CSV.
          csvUrl: campaign.csvDataUrl ?? "",
        });
        useOriginalCampaignStore.getState().setOriginalCampaign({
          ...campaign,
          customFilterConditions: conditionGroup,
        });
        if (campaign.ctaLink) {
          setCtaLink(campaign.ctaLink);
        }
      }
    }

    if (editId) {
      fetchCampaigns();
    }
  }, [editId, currentStepIndex]);

  // TASK-024: when an eventId is in the query (campaign linked to a
  // specific event), pre-fill the CTA link with the customer-facing
  // event URL + UTM attribution. Only fills when ctaLink is empty so
  // we don't trample a host edit.
  useEffect(() => {
    if (!eventId) return;
    if (ctaLink && ctaLink.trim().length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await sdk.getEventForManage({ id: eventId });
        const evt = response?.getEvent;
        if (!evt) return;
        const slugPart = evt.slug || evt._id;
        // UTM follows the Choose flow: source=hoizr_email,
        // medium=email, campaign={campaignId or campaignName slug}.
        const utmCampaign =
          (campaignId ?? campaignTitle ?? "campaign")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "campaign";
        const url =
          `https://hoizr.com/events/${slugPart}` +
          `?utm_source=hoizr_email&utm_medium=email&utm_campaign=${utmCampaign}`;
        if (!cancelled) setCtaLink(url);
      } catch {
        // ignore — host can fill the CTA manually.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { getCmsAllDetails } = await sdk.GetCmsDetails();
        const domainConfig = getCmsAllDetails?.domainConfig;

        setHostOnlineOrderingLink(
          domainConfig?.customDomain
            ? domainConfig?.customDomainwebsite
              ? `https://www.${domainConfig.customDomainwebsite}`
              : ""
            : domainConfig?.website
            ? `https://www.${domainConfig.website}`
            : ""
        );
        if (ctaLink.length < 1) {
          setCtaLink(
            domainConfig?.customDomain
              ? domainConfig?.customDomainwebsite
                ? `https://${domainConfig.customDomainwebsite}`
                : ""
              : domainConfig?.website
              ? `https://${domainConfig.website}`
              : ""
          );
        }

        setHostPrimaryColor(
          getCmsAllDetails?.themeConfig?.primary ?? "#2947c2"
        );
        // setHostBackgroundColor(
        //   getCmsAllDetails?.themeConfig?.background ?? "#ffffff"
        // );
        setHostBackgroundColor(
          isContrastOkay(
            getCmsAllDetails?.themeConfig?.primary || "#2947c2",
            getCmsAllDetails?.themeConfig?.background || "#ffffff"
          )
            ? getCmsAllDetails?.themeConfig?.background || "#ffffff"
            : isContrastOkay(
                getCmsAllDetails?.themeConfig?.primary || "#2947c2",
                "#000000"
              )
            ? "#000000"
            : "#ffffff"
        );
      } catch (error) {
        let errorMessage = extractErrorMessage(error);
        setToastData({
          type: "error",
          message: errorMessage,
        });
      }
    };
    fetchFunc();
  }, [
    setHostBackgroundColor,
    setHostOnlineOrderingLink,
    setHostPrimaryColor,
    setToastData,
  ]);

  const handleContinue = async () => {
    const campaignId = editId;
    const currentState = useCampaignStore.getState();
    const originalState = useOriginalCampaignStore.getState();
    const queryString = getQueryString();

    if (currentStepIndex === steps.length - 1) {
      if (!validateCampaignCreation()) return;
      setIsConfirmationModalOpen(true);
      return;
    }

    const nextStep = steps[currentStepIndex + 1];
    const currentStepLink = steps[currentStepIndex]?.link;

    try {
      // --- Step1: template-select ---
      if (currentStepLink === "template-select") {
        if (!campaignTitle || !campaignSubject || !designJson) {
          setToastData({
            type: "error",
            message:
              "Please add a title, subject, and select a base template to continue.",
          });
          router.push(`/campaigns/onboarding/template-select?${queryString}`);
          return;
        }

        const input: UpdateResEmailCampaignInput = {
          campaignId: editId as string,
        };

        if (originalState.campaignTitle !== currentState.campaignTitle) {
          input.campaignName = currentState.campaignTitle;
        }
        if (originalState.campaignSubject !== currentState.campaignSubject) {
          input.emailSubject = currentState.campaignSubject;
        }
        const templateChanged =
          originalState.designJson !== currentState.designJson ||
          originalState.html !== currentState.html ||
          originalState.content !== currentState.content;

        if (templateChanged) {
          input.emailTemplate = {
            designJson: currentState.designJson,
            html: currentState.html,
            content: currentState.content,
          };
        }

        if (!campaignId) {
          const response = await sdk.createRestaurantEmailCampaign({
            input: {
              campaignName: currentState.campaignTitle,
              emailSubject: currentState.campaignSubject,
              emailTemplate: {
                designJson: currentState.designJson,
                html: currentState.html,
                content: currentState.content,
              },
            },
          });

          const newCampaignId = response.createRestaurantEmailCampaign;
          // Only pass isDuplicate=true if we're actually duplicating a campaign
          const queryParams = isDuplicate
            ? `editId=${newCampaignId}&isEdit=false&isDuplicate=true`
            : `editId=${newCampaignId}&isEdit=false`;
          router.push(`/campaigns/onboarding/${nextStep.link}?${queryParams}`);
          return;
        } else if (Object.keys(input).length > 1) {
          await sdk.updateRestaurantEmailCampaign({ input });
          if (!isDuplicate) {
            useOriginalCampaignStore.setState(currentState);
          }
        }
      }

      // --- Step3: template-target ---
      else if (currentStepLink === "template-target") {
        if (!targetType) {
          setToastData({
            type: "error",
            message: "Please select the target audience for the campaign",
          });
          router.push(`/campaigns/onboarding/template-target?${queryString}`);
          return;
        }

        if (targetCount === 0) {
          setToastData({
            type: "error",
            message: "Audience count cannot be 0. Please update the audience.",
          });
          router.push(`/campaigns/onboarding/template-target?${queryString}`);
          return;
        }

        const input: UpdateResEmailCampaignInput = {
          campaignId: editId as string,
        };

        if (originalState.targetType !== currentState.targetType) {
          input.target = currentState.targetType;
        }

        // Custom mode = multi-chip filter selection. eventId is now an
        // optional independent scope; if the user opened the wizard from
        // an event we still pass it down. Custom mode itself doesn't
        // require an event.
        if (currentState.targetType === CustomEmailTargetType.CustomCustomer) {
          if (!selectedFilters || selectedFilters.length === 0) {
            setToastData({
              type: "error",
              message:
                "Pick at least one audience filter, or switch back to All / CSV.",
            });
            router.push(`/campaigns/onboarding/template-target?${queryString}`);
            return;
          }
          input.filters = selectedFilters as any;
          if (eventId) input.eventId = eventId;
        } else {
          // Clear filters when leaving Custom mode so a stale filter set
          // doesn't silently apply to AllCustomer / Csv runs.
          if (
            originalState.selectedFilters &&
            originalState.selectedFilters.length > 0
          ) {
            input.filters = [];
          }
          if (originalState.targetType === CustomEmailTargetType.CustomCustomer) {
            input.eventId = null as any;
          }
        }

        if (originalState.targetCount !== currentState.targetCount) {
          input.targetCount = currentState.targetCount;
        }

        // Capture the previous CSV URL so we can clean it up AFTER
        // the campaign save commits. Order matters: deleting before
        // save would trip the backend's "still referenced" check and
        // skip the destroy, leaving the orphan. After save, this
        // campaign no longer points at the old URL, so the destroy
        // runs (assuming no duplicate campaign also references it).
        let csvUrlToCleanup: string | null = null;

        if (currentState.targetType === CustomEmailTargetType.Csv) {
          if (
            !areCSVRowsEqual(
              originalState.processedCSVRows,
              currentState.processedCSVRows
            )
          ) {
            // Upload only — don't auto-delete the previous URL from
            // inside the helper (see comment above).
            const csvDataUrl = await handleCSVUpload(
              currentState.processedCSVRows
            );
            if (csvDataUrl) {
              input.csvDataUrl = csvDataUrl;
              csvUrlToCleanup =
                originalState.csvUrl && originalState.csvUrl !== csvDataUrl
                  ? originalState.csvUrl
                  : null;
            }
          } else {
            input.csvDataUrl = currentState.csvUrl;
          }
        }

        if (Object.keys(input).length > 1) {
          await sdk.updateRestaurantEmailCampaign({ input });
          if (!isDuplicate) {
            useOriginalCampaignStore.setState(currentState);
          }

          // Best-effort cleanup of the now-orphaned CSV. Fire-and-forget
          // — a failed call here just leaves an orphan, not a broken
          // campaign. The backend's reference check also makes this
          // safe when a duplicate campaign still points at the same URL.
          if (csvUrlToCleanup) {
            sdk
              .deleteHostCloudinaryAsset({ assetUrl: csvUrlToCleanup })
              .catch((cleanupError: unknown) => {
                // eslint-disable-next-line no-console
                console.warn(
                  "Old campaign CSV cleanup failed",
                  csvUrlToCleanup,
                  cleanupError
                );
              });
          }
        }
      }

      // --- Invalid step ---
      else {
        setToastData({
          type: "error",
          message: "Invalid step. Please try again.",
        });
        return;
      }

      router.push(`/campaigns/onboarding/${nextStep.link}?${queryString}`);
    } catch (error: any) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const handleSaveCampaign = async (isDraft = false) => {
    const currentState = useCampaignStore.getState();
    const originalState = useOriginalCampaignStore.getState();
    const queryString = getQueryString();
    const isDuplicate = (searchParams?.get("isDuplicate") ?? false) as boolean;

    if (currentStepIndex === steps.length - 1) {
      if (!validateCampaignCreation()) return;
    }

    const currentStepLink = steps[currentStepIndex]?.link;

    if (currentStepLink === "schedule") {
      if (!scheduleType) {
        setToastData({
          type: "error",
          message: "Please select a schedule type",
        });
        router.push(`/campaigns/onboarding/schedule?${queryString}`);
        return;
      }

      if (scheduleType === EmailCampaignScheduleTypes.Later && !scheduleDate) {
        setToastData({
          type: "error",
          message: "Please select a schedule date",
        });
        router.push(`/campaigns/onboarding/schedule?${queryString}`);
        return;
      }

      if (scheduleDate && isBefore(scheduleDate, new Date())) {
        setToastData({
          type: "error",
          message: "Please select a future schedule",
        });
        router.push(`/campaigns/onboarding/schedule?${queryString}`);
        return;
      }

      const input: UpdateResEmailCampaignInput = {
        campaignId: editId as string,
      };

      // Always send scheduleType on the final activation step. The
      // backend uses `merged.scheduleType` to choose immediate vs.
      // delayed send; a diff-only update could otherwise drop it
      // when it matches the store default of "Now".
      input.scheduleType = currentState.scheduleType;

      if (
        currentState.scheduleType === EmailCampaignScheduleTypes.Later &&
        !areDatesEqual(originalState.scheduleDate, currentState.scheduleDate)
      ) {
        input.scheduleTime = currentState.scheduleDate;
      }

      input.emailStatus = isDraft
        ? EmailCampaignPublicationStatus.Drafted
        : EmailCampaignPublicationStatus.Active;

      if (Object.keys(input).length > 1 || isDuplicate) {
        try {
          await sdk.updateRestaurantEmailCampaign({ input });
          if (!isDuplicate) {
            useOriginalCampaignStore.setState(currentState);
          }
          setIsConfirmationModalOpen(false);
          setToastData({
            type: "success",
            message: isDraft
              ? "Campaign saved as Draft"
              : "Campaign Successfully Created.",
          });
          router.push("/campaigns/email");
        } catch (err) {
          const message = extractErrorMessage(err);
          // Verification gate from the server — surface the soft modal
          // instead of a generic toast so the host understands the
          // campaign is parked (not lost) until ops verifies them.
          if (
            !isDraft &&
            message.toLowerCase().includes("being verified")
          ) {
            showHostUnderReviewModal(true);
          } else {
            setToastData({
              type: "error",
              message: message || "Failed to update campaign. Please try again.",
            });
          }
        }
      }
    }
  };

  const areFiltersEqual = (
    filters1: CustomCampaignFilter[] | null,
    filters2: CustomCampaignFilter[] | null
  ): boolean => {
    // If both are falsy (null or empty array), they're equal
    if (
      (!filters1 || filters1.length === 0) &&
      (!filters2 || filters2.length === 0)
    ) {
      return true;
    }

    // If only one is falsy, they're not equal
    if (
      !filters1 ||
      !filters2 ||
      filters1.length === 0 ||
      filters2.length === 0
    ) {
      return false;
    }

    // If both have elements but different lengths, they're not equal
    if (filters1.length !== filters2.length) {
      return false;
    }

    // Compare the actual filters
    return filters1.every((f1) => filters2.includes(f1));
  };
  const areCSVRowsEqual = (
    rows1: any[] | null,
    rows2: any[] | null
  ): boolean => {
    if (!rows1 && !rows2) return true;
    if (!rows1 || !rows2) return false;
    if (rows1.length !== rows2.length) return false;
    return JSON.stringify(rows1) === JSON.stringify(rows2);
  };

  const areDatesEqual = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 && !date2) return true;
    if (!date1 || !date2) return false;
    return date1.getTime() === date2.getTime();
  };

  const checkForChanges = (originalState: any, currentState: any): boolean => {
    return (
      originalState.campaignTitle !== currentState.campaignTitle ||
      originalState.campaignSubject !== currentState.campaignSubject ||
      originalState.designJson !== currentState.designJson ||
      originalState.html !== currentState.html ||
      originalState.content !== currentState.content ||
      originalState.targetType !== currentState.targetType ||
      originalState.targetCount !== currentState.targetCount ||
      originalState.scheduleType !== currentState.scheduleType ||
      !areDatesEqual(originalState.scheduleDate, currentState.scheduleDate) ||
      !areFiltersEqual(
        originalState.selectedFilters,
        currentState.selectedFilters
      ) ||
      !areCSVRowsEqual(
        originalState.processedCSVRows,
        currentState.processedCSVRows
      )
    );
  };

  const getButtonLabel = () => {
    const isEditMode = searchParams?.get("isEdit") === "true";
    if (currentStepIndex === steps.length - 1) {
      if (emailStatus === EmailCampaignPublicationStatus.Active) {
        return "Save Changes";
      }
      if (isEditMode) {
        return "Submit";
      }
      return "Create Campaign";
    }
    return "Continue";
  };

  return (
    <div className="bg-white min-h-screen text-black flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-2 border-b h-14">
          <button
            className="group flex items-center space-x-2"
            onClick={handleBackClick}
          >
            <LuArrowLeft className="h-8 w-8 text-gray-500 group-hover:text-black" />
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            {hidePreviewTemplate && (
              <CButton
                variant={ButtonType.Primary}
                onClick={handleContinue}
                type="button"
              >
                {getButtonLabel()}
              </CButton>
            )}
          </div>
        </div>
      </div>
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        <div
          className={`flex-1 flex flex-col gap-4 py-4 px-6 h-full overflow-y-auto ${
            hidePreviewTemplate ? "w-1/2" : "w-full"
          }`}
        >
          {children}
        </div>
        {hidePreviewTemplate && (
          <div className="flex-1 h-full overflow-y-auto">
            <EmailTemplatePreview html={html} />
          </div>
        )}
      </div>
      <ReusableModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        title={`Confirm Campaign ${
          isEdit?.toString() === "true" ? "Update" : "Creation"
        }`}
      >
        <div className="space-y-6 mt-2">
          <div className="space-y-4">
            <p className="font-medium">Campaign Details:</p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-800">Name:</span> {campaignTitle}
              </li>
              <li>
                <span className="text-gray-800">Subject:</span>{" "}
                {campaignSubject}
              </li>
              <li>
                <span className="text-gray-800">Target Audience:</span>{" "}
                {targetType === CustomEmailTargetType.AllCustomer
                  ? "All attendees"
                  : targetType === CustomEmailTargetType.Csv
                  ? `CSV Upload (${processedCSVRows?.length || 0} recipients)`
                  : "This event"}
              </li>
              <li>
                <span className="text-gray-800">Schedule:</span>{" "}
                {scheduleType === EmailCampaignScheduleTypes.Now
                  ? "Send Immediately"
                  : `Scheduled for ${
                      scheduleDate
                        ? DateTime.fromJSDate(scheduleDate)
                            .setZone(hostTz)
                            .toFormat("MM/dd/yyyy h:mm a")
                        : "unknown date"
                    }`}
              </li>
              {targetCount > 0 && (
                <li>
                  <span className="text-gray-800">Total Recipients:</span>{" "}
                  {targetCount}
                </li>
              )}
            </ul>
            <p>
              {isEdit?.toString() === "true"
                ? "Are you sure you want to submit this details?"
                : "Are you sure you want to create this campaign?"}
            </p>
          </div>
          <div className="flex gap-2 justify-end ">
            {emailStatus !== EmailCampaignPublicationStatus.Active && (
              <CButton
                variant={ButtonType.Secondary}
                onClick={() => handleSaveCampaign(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Save as Draft"}
              </CButton>
            )}
            <CButton
              variant={ButtonType.Primary}
              onClick={() => handleSaveCampaign(false)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : emailStatus === EmailCampaignPublicationStatus.Active
                ? "Save Changes"
                : searchParams?.get("isEdit") === "true"
                ? "Save & Mark as Active"
                : "Create Campaign"}
            </CButton>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default OnboardingCampaignLayout;

// wheenver the id is present in the query fetch the campaingdetails by id and sote in currect store
// fetch useeffect use current step as dependency
// in step 1 i will check if id is present in the query or not if not then call add api else call update api
//
