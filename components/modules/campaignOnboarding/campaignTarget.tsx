// @ts-nocheck
import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import {
  CustomCampaignFilter,
  CustomEmailTargetType,
} from "@/generated/graphql";
import useCampaignStore from "@/store/customCampaignStore";

import {
  CampaignCsvRowType,
  sanitizeData,
  validateEmail,
  validateName,
  validatePhone,
} from "@/utils/campaignCSVHelpler";
import { sdk } from "@/utils/graphqlClient";
import { convertCustomFilterToInput } from "@/utils/utilFUncs";
import { saveAs } from "file-saver";
import debounce from "lodash/debounce";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaSpinner } from "react-icons/fa";
import CustomFilterBuilder, {
  Condition,
  ConditionGroup,
  CUSTOM_CAMPAIGN_OPERATORS_BY_TYPE,
  CUSTOM_CAMPAIGN_QUERY_FIELDS,
  FilterItem,
} from "./customFilterBuilder";

const filterDescriptions = {
  [CustomCampaignFilter.Active]: {
    description: "Customers who ordered within last 30 days",
  },
  [CustomCampaignFilter.Dormant]: {
    description: "Customers who haven't ordered in last 90 days",
  },
  [CustomCampaignFilter.Repeat]: {
    description: "Customers who have ordered more than once",
  },
  [CustomCampaignFilter.NewCustomers]: {
    description: "Customers who have created an account in last 7 days",
  },
  [CustomCampaignFilter.TopSpenders]: {
    description: "Customers who have spent more than ₹2,000 within last 30 days",
  },
  [CustomCampaignFilter.Male]: {
    description: "Customers marked as male",
  },
  [CustomCampaignFilter.Female]: {
    description: "Customers marked as female",
  },
  [CustomCampaignFilter.Other]: {
    description: "Customers marked as another gender",
  },
};

const formatFilterLabel = (filter: string): string => {
  return filter
    .split(/(?=[A-Z])/)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());
};

const CSVGuidelines = () => (
  <div className="space-y-4 p-4 border rounded-xl">
    <h3 className="font-semibold">CSV File Guidelines</h3>
    <p className="text-xs text-gray-500">{`By uploading the users data you agree that you have taken necessary permissions to send emails to these users.`}</p>

    <div className="space-y-3">
      <div>
        <h4 className="font-medium">Email</h4>
        <p className="text-sm text-gray-600">
          Required. Must be a valid email format.
        </p>
      </div>

      <div>
        <h4 className="font-medium">Name</h4>
        <p className="text-sm text-gray-600">
          Required. Must contain only letters.
        </p>
      </div>

      <div>
        <h4 className="font-medium">Phone</h4>
        <p className="text-sm text-gray-600">
          Optional. Must be a valid phone number without country code.
        </p>
      </div>

      {/* <div>
        <h4 className="font-medium">Birthday</h4>
        <p className="text-sm text-gray-600">
          Optional. Preferred formats: YYYY-MM-DD or MM-DD-YYYY
        </p>
      </div> */}
    </div>
  </div>
);

const CampaignAudience = () => {
  const router = useRouter();
  const eventId =
    typeof router.query.eventId === "string" ? router.query.eventId : undefined;
  const {
    targetType,
    setTargetType,
    selectedFilters,
    toggleFilter,
    setSelectedFilters,
    setProcessedCSVRows,
    processedCSVRows,
    setCampaignTargetCount,
    targetCount,
    campaignId,
    uploadedCSVFile,
    setUploadedCSVFile,
    customFilterConditions,
    setCustomFilterConditions,
  } = useCampaignStore();

  //CSV STATES
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [countLoading, setCountLoading] = useState(false);
  const [queryLiterature, setQueryLiterature] = useState<string>("");
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const csvFile = acceptedFiles[0];
      setUploadedCSVFile(csvFile);
      processCsvData(csvFile);
    },
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  // useEffect(() => {
  //   fetchSubscriberCount();
  // }, [targetType, selectedFilters, processedCSVRows, uploadedCSVFile,customFilterConditions]);
  useEffect(() => {
    // Immediate update for CSV
    if (targetType === CustomEmailTargetType.Csv) {
      setCampaignTargetCount(processedCSVRows?.length || 0);
      return;
    }

    debouncedFetchCount(targetType, eventId, selectedFilters);

    return () => debouncedFetchCount.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetType,
    processedCSVRows,
    uploadedCSVFile,
    eventId,
    selectedFilters,
  ]);

useEffect(() => {
    if (campaignId || processedCSVRows) {
      setProcessedData(processedCSVRows ?? []);
    }
  }, [campaignId, processedCSVRows]);


  useEffect(() => {
    setQueryLiterature(createQueryLiterature(customFilterConditions));
    setCustomFilterConditions(customFilterConditions);
  }, [customFilterConditions]);

  const createQueryLiterature = (group: ConditionGroup): string => {
    if (group.items.length === 0) return "No conditions specified";

    const formatValue = (condition: Condition): string => {
      const fieldConfig = CUSTOM_CAMPAIGN_QUERY_FIELDS.find(
        (f) => f.value === condition.field
      );

      // Handle special field formatting
      switch (condition.field) {
        case "ltv":
          return `$${condition.value}`;
        case "peakOrderHour":
          const hour = parseInt(condition.value as string);
          return `${hour.toString().padStart(2, "0")}:00`;
        case "lastOrderDate":
        case "birthday":
          return new Date(condition.value as string).toLocaleDateString();
      }

      // Handle operator-specific formatting
      if (
        condition.operator === "inLast" ||
        condition.operator === "inComing"
      ) {
        return `${condition.value} ${condition.timeUnit}`;
      }

      // Default formatting
      if (fieldConfig?.type === "boolean") {
        return condition.value ? "enabled" : "disabled";
      }

      return condition.value.toString();
    };

    const processItem = (item: FilterItem): string => {
      if ("type" in item) {
        const groupContent = item.items
          .map(processItem)
          .filter(Boolean)
          .join(` ${item.connector.toUpperCase()} `);

        return item.items.length > 1 ? `(${groupContent})` : groupContent;
      }

      if (!isConditionValid(item)) return "";

      const field =
        CUSTOM_CAMPAIGN_QUERY_FIELDS.find((f) => f.value === item.field)
          ?.label || item.field;
      const operator =
        CUSTOM_CAMPAIGN_OPERATORS_BY_TYPE[item.fieldType].find(
          (op) => op.value === item.operator
        )?.label || item.operator;

      let value = formatValue(item);

      // Special case for boolean fields
      if (item.fieldType === "boolean") {
        return `${field} ${operator} ${value}`;
      }

      // Special case for time-based operators
      if (item.operator === "inLast" || item.operator === "inComing") {
        return `${field} ${operator} ${value}`;
      }

      return `${field} ${operator} ${value}`;
    };

    const connector = group.connector.toUpperCase();
    const parts = group.items
      .map(processItem)
      .filter(Boolean)
      .join(` ${connector} `);

    return parts || "Invalid conditions";
  };

  const isConditionValid = (condition: Condition): boolean => {
    // Check if field is selected
    if (!condition.field) return false;

    // Check if operator is selected
    if (!condition.operator) return false;

    // Check if value is provided and valid
    if (
      condition.value === undefined ||
      condition.value === null ||
      condition.value === ""
    ) {
      return false;
    }

    // Special validation for date with "inLast" operator
    if (condition.fieldType === "date" && condition.operator === "inLast") {
      if (!condition.timeUnit) return false;

      const numValue = Number(condition.value);
      if (isNaN(numValue) || numValue <= 0) return false;
    }

    // Special validation for number fields
    if (condition.fieldType === "number") {
      const numValue = Number(condition.value);
      if (isNaN(numValue)) return false;
    }

    return true;
  };

  const generateFilterQuery = (group: ConditionGroup): string => {
    if (group.items.length === 0) return "";

    const itemStrings = group.items.map((item) => {
      if ("type" in item) {
        // This is a nested group
        return `(${generateFilterQuery(item)})`;
      } else {
        // This is a simple condition
        let valueStr = "";

        if (item.fieldType === "date" && item.operator === "inLast") {
          valueStr = `${item.value} ${item.timeUnit}`;
        } else if (item.fieldType === "boolean") {
          valueStr = item.value ? "enabled" : "disabled";
        } else {
          valueStr = String(item.value);
        }

        return `${item.field} ${item.operator} ${valueStr}`;
      }
    });

    return itemStrings.join(` ${group.connector.toUpperCase()} `);
  };

  //   const fetchSubscriberCount = async () => {
  //     if (targetType === CustomEmailTargetType.Csv) {
  //       setCampaignTargetCount(processedCSVRows?.length || 0);
  //       return;
  //     }

  //     setCountLoading(true);
  //     try {
  //       const count = await sdk.getCustomersForTarget({
  //         target: targetType,
  //         filters: selectedFilters ?? [],
  // customFilter: selectedFilters?.includes(CustomCampaignFilter.Custom)
  //     ? convertCustomFilterToInput(customFilterConditions)
  //     : null      });
  //       setCampaignTargetCount(count.getRestaurantCustomersTargetCount);
  //     } catch (error) {
  //       console.error("Error fetching subscriber count:", error);

  //       setCampaignTargetCount(0);
  //     }
  //     setCountLoading(false);
  //   };

  useEffect(() => {
    if (uploadedCSVFile && targetType === CustomEmailTargetType.Csv) {
      processCsvData(uploadedCSVFile);
    }
  }, [uploadedCSVFile, targetType]);

  const processCsvData = (file: File) => {
    const requiredHeaders = ["email", "name"];
    const optionalHeaders = ["phone"];
    const allHeaders = [...requiredHeaders, ...optionalHeaders];

    Papa.parse<CampaignCsvRowType>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: CampaignCsvRowType[] = [];
        const processErrors: string[] = [];
        const headers = Object.keys(results.data[0] || {});

        // Check if headers match and are in the correct order
        const isHeaderValid =
          headers.length === allHeaders.length &&
          headers.every(
            (header, index) => header.toLowerCase() === allHeaders[index]
          );

        if (!isHeaderValid) {
          setErrors([
            "CSV file headers are incorrect or not in the expected order.",
          ]);
          setProcessedData([]);
          setProcessedCSVRows([]);
          return;
        }

        // TODO: add validation for same email
        results.data.forEach((row, index) => {
          let rowError = false;

          // Validate required fields
          if (!row.email || !row["name"]) {
            processErrors.push(`Row ${index + 1}: Missing required fields`);
            rowError = true;
          }

          // Validate email
          if (!rowError && !validateEmail(row.email)) {
            processErrors.push(`Row ${index + 1}: Invalid email format`);
            rowError = true;
          }

          // Validate names
          if (!rowError && !validateName(row["name"])) {
            processErrors.push(`Row ${index + 1}: Invalid name format`);
            rowError = true;
          }

          // Validate optional fields
          if (!rowError && !validatePhone(row.phone || "")) {
            processErrors.push(`Row ${index + 1}: Invalid phone number`);
            rowError = true;
          }

          // If no errors, sanitize and add to valid rows
          if (!rowError) {
            validRows.push(sanitizeData(row));
          }
        });

        if (processErrors.length > 0) {
          setErrors(processErrors);
          setProcessedData([]);
          setProcessedCSVRows([]);
        } else {
          setErrors([]);
          setProcessedData(validRows);
          setProcessedCSVRows(validRows);
        }
      },
      error: (error) => {
        setProcessedData([]);
        setProcessedCSVRows([]);

        console.error("CSV Parsing Error:", error);
        setErrors(["Error parsing CSV file"]);
      },
    });
  };

  const handleDownloadTemplate = () => {
    saveAs(
      "https://res.cloudinary.com/choose-pos/raw/upload/v1745426860/campaigns-csv-data_gapowz.csv"
    );
  };

  const debouncedFetchCount = useRef(
    debounce(
      async (
        currentTargetType: any,
        selectedEventId: string | undefined,
        currentFilters: string[] | null
      ) => {
        if (currentTargetType === CustomEmailTargetType.Csv) return;

        setCountLoading(true);
        try {
          const count = await sdk.getCustomersForTarget({
            target: currentTargetType,
            eventId: selectedEventId ?? null,
            filters:
              currentTargetType === CustomEmailTargetType.CustomCustomer &&
              currentFilters &&
              currentFilters.length > 0
                ? currentFilters
                : null,
          });
          setCampaignTargetCount(count.getRestaurantCustomersTargetCount);
        } catch (error) {
          console.error("Error fetching subscriber count:", error);
          setCampaignTargetCount(0);
        } finally {
          setCountLoading(false);
        }
      },
      500
    )
  ).current;

  const isCustomFilterValid = (group: ConditionGroup): boolean => {
    const validateItem = (item: FilterItem): boolean => {
      if ("type" in item) {
        return item.items.every(validateItem);
      }
      return isConditionValid(item);
    };

    return group.items.every(validateItem);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium mb-4">Who do you want to reach?</h1>
        <p className="text-gray-600 mb-4 pt-1 text-sm">
          Select the ticket buyers who should receive this campaign.
        </p>
      </div>

      <div>
        <div className="grid gap-3 mb-6 sm:grid-cols-3">
          {[
            {
              value: CustomEmailTargetType.AllCustomer,
              title: eventId ? "All attendees" : "All customers",
              body: eventId
                ? "Everyone who bought tickets, plus your followers and the event's artists/collaborators."
                : "All of your followers, plus everyone who has bought tickets from you.",
            },
            {
              value: CustomEmailTargetType.CustomCustomer,
              title: "Custom",
              body: "Pick filters like Active, Top Spenders, gender — combine as needed.",
            },
            {
              value: CustomEmailTargetType.Csv,
              title: "CSV upload",
              body: "Upload a consented list with email and name.",
            },
          ].map((option) => {
            const selected = targetType === option.value;
            return (
              <button
                key={option.value}
                className={`min-h-[132px] rounded-owner-md border p-4 text-left transition ${
                  selected
                    ? "border-owner-blue-500 bg-owner-blue-050 ring-2 ring-owner-blue-100"
                    : "border-owner-border bg-owner-bg hover:border-owner-border-strong"
                }`}
                onClick={() => setTargetType(option.value)}
              >
                <h3 className="font-semibold text-owner-fg-1">
                  {option.title}
                </h3>
                <p className="mt-2 text-sm leading-5 text-owner-fg-3">
                  {option.body}
                </p>
              </button>
            );
          })}
        </div>

        {targetType === CustomEmailTargetType.CustomCustomer && (
          <div className="mb-6 rounded-owner-md border border-owner-border bg-owner-bg p-4">
            <h3 className="font-medium text-owner-fg-1 mb-1">
              Pick audience filters
            </h3>
            <p className="text-xs text-owner-fg-3 mb-4">
              We&apos;ll send to anyone matching at least one selected filter.
              Filters tolerate missing customer data, so a customer with no
              gender on file just isn&apos;t matched by a gender chip.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "Active", label: "Active · ordered <30d" },
                { value: "Dormant", label: "Dormant · no order >90d" },
                { value: "NewCustomers", label: "New · signed up <7d" },
                { value: "Repeat", label: "Repeat · >1 order" },
                { value: "TopSpenders", label: "Top spenders · >₹2,000/30d" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ].map((chip) => {
                const isOn = (selectedFilters ?? []).includes(chip.value);
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => toggleFilter(chip.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isOn
                        ? "border-owner-blue-500 bg-owner-blue-050 text-owner-blue-700"
                        : "border-owner-border bg-owner-bg text-owner-fg-2 hover:border-owner-border-strong"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
            {(selectedFilters ?? []).length === 0 && (
              <p className="mt-3 text-xs text-owner-warning-text">
                Select at least one filter to compute your audience.
              </p>
            )}
          </div>
        )}

        {targetType === CustomEmailTargetType.Csv && (
          <div className="space-y-4">
            <CSVGuidelines />
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="owner-btn owner-btn--secondary mb-2 w-full justify-center"
            >
              <Download size={16} />
              Download CSV Template
            </button>

            {/* CSV Upload Area */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed p-6 text-center cursor-pointer"
            >
              <input {...getInputProps()} />
              {uploadedCSVFile ? (
                <p>{uploadedCSVFile.name}</p>
              ) : (
                <p>{"Drag 'n' drop a CSV file, or click to select"}</p>
              )}
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded">
                <h4 className="font-semibold text-red-600">
                  Validation Errors
                </h4>
                <ul className="list-disc pl-5">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-500">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Component */}

            {processedData.length > 0 && (
              <CButton
                variant={ButtonType.Outlined}
                onClick={() => setIsPreviewModalOpen(true)}
                className="w-full "
              >
                <div className="flex items-center  justify-center">
                  Preview Upload
                </div>
              </CButton>
            )}
          </div>
        )}
        <div className="mt-4">
          <h3 className="font-medium mb-2">TOTAL AUDIENCE</h3>
          <div className="p-4 border rounded-xl">
            {countLoading ? (
              <span className="flex items-center gap-2">
                <FaSpinner
                  className="animate-spin text-primary "
                  overlineThickness={10}
                  size={16}
                />
                Loading...
              </span>
            ) : (
              `${targetCount} Audience`
            )}
          </div>
        </div>
      </div>
      <ReusableModal
        width="lg"
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Customers Preview"
        comments="This is a preview of the customers who will receive this campaign, only the first 10 customers are shown from CSV file  ."
      >
        <PreviewCampaignUploads data={processedData} />
      </ReusableModal>
    </div>
  );
};

export default CampaignAudience;

const PreviewCampaignUploads = ({ data }: { data: any[] }) => {
  return (
    <div className="border rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).slice(0, 10).map((row, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{row.email}</td>
                <td className="p-2">{row["name"]}</td>
                <td className="p-2">{row.phone || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
