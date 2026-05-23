import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import DataTable from "@/components/common/dataTable";
import DataTableDateTimeCell from "@/components/common/dataTable/common/dateTimeCell";
import DataTableNumberCell from "@/components/common/dataTable/common/numberCell";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import ReusableModal from "@/components/common/modal/modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CustomCampaignFilter,
  EmailCampaignPublicationStatus,
  EmailCampaignScheduleTypes,
  FilterDataEnum,
  FilterDataInput,
  PermissionTypeEnum,
  HostEmailCampaignStatusEnum,
  RowsPerPageEnum,
  SortDataEnum,
  SortDataInput,
} from "@/generated/graphql";
import useCampaignStore from "@/store/customCampaignStore";
import useGlobalStore from "@/store/global";
import useOriginalCampaignStore from "@/store/originalCampaignStore";
import useHostsStore from "@/store/host";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import {
  convertApiCustomFiltersToConditionGroup,
  extractErrorMessage,
  formatResEmailFilters,
  formatHostEmailStatus,
  formatResEmailTarget,
  getPageSizeEnum,
  getPageSizeNumber,
} from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { PlusCircleIcon } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { BsCopy } from "react-icons/bs";
import Loader from "@/components/loader";
import EmailTemplatePreview from "@/components/common/emailTemplatePreview/emailTemplatePreview";
import { FiInfo } from "react-icons/fi";
import MarketingCreditWarning from "../MarketingCreditWarning";

interface MailActivity {
  email: string;
  date: string;
}

interface EmailTemplate {
  content: string;
  designJson: string;
  html: string;
}

interface StatusChangeHistory {
  timestamp: string;
  status: string;
}

interface CampaignStats {
  mailsSent: number;
  mailsDelivered: number;
  mailsOpened: MailActivity[];
  mailsClicked: MailActivity[];
}

interface RestaurantCampaignType {
  _id: string;
  campaignName: string;
  emailSubject: string;
  emailTemplate: EmailTemplate;
  status: string;
  target: string;
  filters: string[];
  csvDataUrl: string;
  statusChangeHistory: StatusChangeHistory[];
  scheduleType: string;
  scheduleTime: Date;
  stats: CampaignStats;
  salesContribution: number;
  emailStatus: EmailCampaignPublicationStatus;
  sentAt: Date;
  createdAt: Date;
  targetCount?: number | null;
}

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

const CustomCampaigns: NextPageWithLayout = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const { hostLogo } = useHostsStore();
  const [reload, setReload] = useState<number>(1);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewCampaign, setPreviewCampaign] =
    useState<RestaurantCampaignType | null>(null);

  // Table Pagination States
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);
  const [pageSize, setPageSize] = useState<RowsPerPageEnum>(
    RowsPerPageEnum.Ten
  );

  // Table Filter States
  const [filterData, setFilterData] = useState<{
    key?: string;
    filterFn?: FilterDataEnum;
    value?: string | string[];
  }>();
  const [searchFilter, setSearchFilter] = useState<string>();

  // Table Sorting States
  const [sortData, setSortData] = useState<{
    key?: string;
    sortType?: SortDataEnum;
  }>();

  // Table Download States
  const downloadFileName = useMemo(() => "GiftCardData", []);
  const [downloadBtnLoading, setDownloadBtnLoading] = useState(false);
  const router = useRouter();

  // Delete Campaign
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteCampId, setDeleteCampId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        let filterInput: FilterDataInput | null = null;
        let sortInput: SortDataInput | null = null;

        if (
          filterData &&
          filterData.key &&
          filterData.value &&
          filterData.filterFn
        ) {
          filterInput = {
            key: filterData.key,
            operation: filterData.filterFn,
          };

          if (Array.isArray(filterData.value)) {
            filterInput.valueArr = filterData.value as string[];
          } else {
            filterInput.value = filterData.value.toString();
          }
        }

        if (sortData) {
          if (sortData.key && sortData.sortType) {
            sortInput = {
              key: sortData.key,
              sortType: sortData.sortType,
            };
          }
        }

        const response = await sdk.getAllRestauranteEmailCampaigns({
          pagination: {
            pageNumber: pageIndex,
            rowsPerPage: pageSize,
          },
          filter: filterInput ? [filterInput] : null,
          sort: sortInput,
          search: (searchFilter ?? "") === "" ? null : searchFilter,
        });
        if (!response?.getAllRestauranteEmailCampaigns) {
          setToastData({
            type: "error",
            message:
              "Something went wrong loading the templates. Please refresh or try again later.",
          });
          return;
        }

        // setData(response.fetchCreatedPromoCodes.promoCodes);
        setData(response.getAllRestauranteEmailCampaigns.items);
        setTotalData(response.getAllRestauranteEmailCampaigns.total);
      } catch (error: any) {
        const errorMessage = extractErrorMessage(error);
        setToastData({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    setSelectedSideBarMenu("Campaigns");
    fetchCampaigns();
  }, [
    setToastData,
    setSelectedSideBarMenu,
    reload,
    pageIndex,
    pageSize,
    filterData,
    sortData,
    searchFilter,
  ]);

  const handlePreviewCampaign = (campaign: RestaurantCampaignType) => {
    setPreviewCampaign(campaign);
    setIsPreviewModalOpen(true);
  };

  const giveFinalEmailCampaignStatus = (
    emailStatus: string,
    status: string
  ) => {
    if (status) return "Drafted";

    if (emailStatus === EmailCampaignPublicationStatus.Active) {
      return formatHostEmailStatus(status);
    } else return "Drafted";
  };

  const handleDeleteCampaign = async (id: string) => {
    setEditLoading(true);
    try {
      const res = await sdk.deleteRestaurantEmailCampaign({ input: id });
      if (res?.deleteRestaurantEmailCampaign) {
        setToastData({
          type: "success",
          message: "Campaign deleted successfully!",
        });
      }
      setReload(reload + 1);
    } catch (error: any) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setEditLoading(false);
    }
  };

  const editCampaign = async (id: string) => {
    // Find the campaign data by id to get the email status
    resetBothStores();

    const campaignData = data.find((campaign) => campaign._id === id);

    // Route based on email status
    if (campaignData.emailStatus === EmailCampaignPublicationStatus.Drafted) {
      router.push(
        `/campaigns/onboarding/template-select?editId=${id}&isEdit=true`
      );
    } else if (
      campaignData.emailStatus === EmailCampaignPublicationStatus.Active
    ) {
      router.push(`/campaigns/onboarding/schedule?editId=${id}&isEdit=true`);
    } else {
      // Fallback for any other status
      router.push(
        `/campaigns/onboarding/template-select?editId=${id}&isEdit=true`
      );
    }
  };

  const getStatusColor = (statuscolor: string) => {
    switch (statuscolor?.toString()) {
      case "Drafted":
        return "bg-gray-200 text-gray-600";
      case "Scheduled":
        return "bg-blue-100 text-blue-600";
      case "Processing":
        return "bg-amber-100 text-amber-600";
      case "Completed":
        return "bg-green-100 text-green-600";
      case "Failed":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const resetBothStores = () => {
    useCampaignStore.getState().resetCampaignState();
    useOriginalCampaignStore.getState().resetOriginalState();
  };

  const duplicateCampaign = async (id: string) => {
    setEditLoading(true);
    try {
      const response = await sdk.duplicateHostEmailCampaign({ campaignId: id });
      if (response?.duplicateHostEmailCampaign) {
        setToastData({
          type: "success",
          message: "Campaign duplicated as a draft.",
        });
        setReload((current) => current + 1);
      }
    } catch (error: any) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setEditLoading(false);
    }
  };

  const highestPendingEstimate = useMemo(() => {
    return data.reduce(
      (largest, campaign) => {
        const isPending =
          campaign.emailStatus === EmailCampaignPublicationStatus.Drafted ||
          campaign.status === HostEmailCampaignStatusEnum.Scheduled ||
          campaign.status === null ||
          campaign.status === undefined;
        const targetCount = Number(campaign.targetCount ?? 0);
        if (!isPending || targetCount <= largest.estimatedCost) {
          return largest;
        }

        return {
          estimatedCost: targetCount,
          audienceCount: targetCount,
          label: campaign.campaignName
            ? `"${campaign.campaignName}"`
            : "this campaign",
        };
      },
      { estimatedCost: 0, audienceCount: 0, label: "this campaign" }
    );
  }, [data]);

  const columnHelper = createColumnHelper<RestaurantCampaignType>();

  const columns: ColumnDef<RestaurantCampaignType, any>[] = useMemo(
    () => [
      columnHelper.accessor("campaignName", {
        header: "Campaign Name",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            className="cursor-pointer"
            onClick={() => handlePreviewCampaign(row.original)}
            value={row.original.campaignName}
          />
        ),
      }),
      columnHelper.accessor("emailSubject", {
        header: "Email Subject",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            className="cursor-pointer"
            onClick={() => handlePreviewCampaign(row.original)}
            value={row.original.emailSubject}
          />
        ),
      }),

      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,

        cell: ({ row }) => {
          const status =
            row.original.emailStatus === EmailCampaignPublicationStatus.Drafted
              ? "Drafted"
              : row.original.status !== null
              ? formatHostEmailStatus(row.original.status)
              : "Drafted";

          return (
            <DataTableTextCell
              value={status}
              className={`px-3 py-1 text-sm font-medium justify-center rounded-full inline-block ${getStatusColor(
                status
              )}`}
            />
          );
        },
      }),

      columnHelper.accessor("sentAt", {
        header: "Sent Date",
        enableColumnFilter: false,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableDateTimeCell value={row.original.sentAt} />
        ),
      }),

      columnHelper.accessor("stats.mailsSent", {
        header: "Mails Sent",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell value={row.original.stats.mailsSent} />
        ),
      }),
      columnHelper.accessor("stats.mailsDelivered", {
        header: "Mails Delivered",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell value={row.original.stats.mailsDelivered} />
        ),
      }),
      columnHelper.accessor("stats.mailsOpened", {
        header: "Mails Opened",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell value={row.original.stats.mailsOpened.length} />
        ),
      }),
      columnHelper.accessor("stats.mailsClicked", {
        header: "Mails Clicked",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell value={row.original.stats.mailsClicked.length} />
        ),
      }),
      columnHelper.accessor("salesContribution", {
        header: "Net Sales",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell
            value={row.original.salesContribution}
            isPrice={true}
          />
        ),
      }),
      columnHelper.accessor("target", {
        header: "Target",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={formatResEmailTarget(row.original.target)}
          />
        ),
      }),
      columnHelper.accessor("filters", {
        header: "Filters",
        enableColumnFilter: false,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={
              row.original.filters
                ?.map((f) => formatResEmailFilters(f as CustomCampaignFilter))
                .join(", ") || "N/A"
            }
          />
        ),
      }),
      columnHelper.accessor("scheduleType", {
        header: "Schedule Type",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.scheduleType} />
        ),
      }),
      columnHelper.accessor("scheduleTime", {
        header: "Schedule Time",
        enableColumnFilter: false,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableDateTimeCell value={row.original.scheduleTime} />
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created Date",
        enableColumnFilter: false,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableDateTimeCell value={row.original.createdAt} />
        ),
      }),
      

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const now = new Date();

          const canEdit =
            // 1) Always editable if Drafted
            row.original.emailStatus ===
              EmailCampaignPublicationStatus.Drafted ||
            // 2) If schedule/status is missing → treat as Drafted
            row.original.scheduleType == null ||
            row.original.status == null ||
            // 3) Editable if it's scheduled for later in the future
            (row.original.scheduleType === EmailCampaignScheduleTypes.Later &&
              row.original.status ===
                HostEmailCampaignStatusEnum.Scheduled &&
              new Date(row.original.scheduleTime) > now);

          return (
            <TooltipProvider>
              {/* Delete Icon */}
              {canEdit ? (
                <div className="flex space-x-2 justify-center items-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <FiInfo
                        className="text-primary font-bold text-lg cursor-pointer"
                        onClick={() => handlePreviewCampaign(row.original)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Preview campaign</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdOutlineEdit
                        className="text-primary text-lg cursor-pointer"
                        onClick={() => editCampaign(row.original._id ?? "")}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Edit campaign</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <BsCopy
                        className="text-primary text-sm cursor-pointer"
                        onClick={() =>
                          duplicateCampaign(row.original._id ?? "")
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Duplicate</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdDeleteOutline
                        className="text-primary text-lg cursor-pointer"
                        onClick={() => {
                          setDeleteCampId(row.original._id ?? "");
                          setIsDeleteModalOpen(true);
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Delete Campaign</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <div className="flex space-x-2 justify-center items-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <FiInfo
                        className="text-primary font-bold text-lg cursor-pointer"
                        onClick={() => handlePreviewCampaign(row.original)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Preview campaign</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <BsCopy
                        className="text-primary text-sm cursor-pointer"
                        onClick={() =>
                          duplicateCampaign(row.original._id ?? "")
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Duplicate</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Edit Role Icon */}
            </TooltipProvider>
          );
        },
      }),
    ],
    [columnHelper, editCampaign]
  );

  const handleCsvDownload = async (selectedIds?: string[]) => {
    setDownloadBtnLoading(true);
    try {
      const response = await sdk.hostEmailCampaignCsvExport({
        input: {
          fileName: "campaignData",
          selectedRows: selectedIds,
        },
      });

      if (!response.hostEmailCampaignCsvExport) {
        setToastData({
          message:
            "Something went wrong while exporting your data. Please try again later!",
          type: "error",
        });
        return;
      }

      window.open(
        response.hostEmailCampaignCsvExport,
        "_blank",
        "noreferrer"
      );
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setDownloadBtnLoading(false);
    }
  };

  return (
    <div className="py-2">
      {editLoading ? (
        <div className="flex items-center justify-center h-full">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : (
        <>
          {data.length > 0 ||
          loading ||
          filterData !== undefined ||
          sortData !== undefined ||
          (searchFilter ?? "") !== "" ? (
            <div className="space-y-4">
              <MarketingCreditWarning
                estimatedCost={highestPendingEstimate.estimatedCost}
                audienceCount={highestPendingEstimate.audienceCount}
                label={highestPendingEstimate.label}
              />
              <DataTable
                totalRows={totalData}
                columns={columns}
                data={data}
                loading={loading}
                addClickHandler={() => {
                  if (!hostLogo) {
                    setToastData({
                      type: "error",
                      message: "Please upload your host logo first",
                    });
                    return;
                  } else {
                    resetBothStores();
                    router.push("/campaigns/onboarding/template-select");
                  }
                }}
                manualPagination={true}
                pageSize={getPageSizeNumber(pageSize)}
                pageCount={Math.ceil(totalData / getPageSizeNumber(pageSize))}
                nextPage={() => {
                  const totalPages = Math.ceil(
                    totalData / getPageSizeNumber(pageSize)
                  );
                  if (pageIndex < totalPages) {
                    setPageIndex((prev) => prev + 1);
                  }
                }}
                prevPage={() => {
                  if (pageIndex > 1) {
                    setPageIndex((prev) => prev - 1);
                  }
                }}
                paginationData={{
                  pageIndex: pageIndex - 1, // tanstack table considers index to start from 0
                  pageSize: getPageSizeNumber(pageSize),
                }}
                pageSizeChangeHandler={(size) => {
                  setPageIndex(1);
                  setPageSize(getPageSizeEnum(size));
                }}
                downloadClickHandler={async (selectedIds) => {
                  handleCsvDownload(selectedIds);
                }}
                downloadFileName={downloadFileName}
                downloadLoading={downloadBtnLoading}
                filterClickHandler={async (data) => {
                  setPageIndex(1);
                  setSearchFilter(undefined);
                  setFilterData(data);
                }}
                sortClickHandler={async (data) => {
                  setSortData(data);
                }}
                setSearchFilter={(e) => {
                  setPageIndex(1);
                  setFilterData(undefined);
                  setSearchFilter(e);
                }}
              />
            </div>
          ) : (
            <div className="bg-white text-black rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] space-y-4 border border-gray-300 shadow-sm">
              <div className="text-base font-light text-blackBg whitespace-pre-wrap text-center">
                {"No campaigns found,\nstart by adding your first campaign."}
              </div>
              <button
                onClick={() => {
                  if (!hostLogo) {
                    setToastData({
                      type: "error",
                      message: "Please upload your host logo first",
                    });
                    return;
                  } else {
                    resetBothStores();
                    router.push("/campaigns/onboarding/template-select");
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex justify-between items-center space-x-2 text-sm"
              >
                <PlusCircleIcon size={15} />
                <span>{"Add"}</span>
              </button>
            </div>
          )}
        </>
      )}

      <ReusableModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteCampId(null);
        }}
        title="Delete Campaign"
      >
        <div className="flex flex-col space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this Campaign? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <CButton
              variant={ButtonType.Primary}
              onClick={() => {
                if (deleteCampId) {
                  handleDeleteCampaign(deleteCampId);
                  setIsDeleteModalOpen(false);
                  setDeleteCampId(null);
                }
              }}
            >
              Delete
            </CButton>
          </div>
        </div>
      </ReusableModal>

      {/* Preview Campaign Modal */}
      <ReusableModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewCampaign(null);
        }}
        width="ml"
        title={`Preview Campaign: ${previewCampaign?.campaignName || ""}`}
      >
        <div className="overflow-y-auto">
          {previewCampaign?.emailTemplate?.html ? (
            <EmailTemplatePreview html={previewCampaign.emailTemplate.html} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No email template available for preview</p>
            </div>
          )}
        </div>
      </ReusableModal>
    </div>
  );
};

export default CustomCampaigns;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookieHeader = context.req.headers.cookie ?? "";
  const tokenExists = cookieHeader.includes("accessToken=");

  if (!tokenExists) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const [userResponse, journeyResponse] = await Promise.all([
      sdk.MeCheckUser(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
      sdk.MeUserJourney(
        {},
        {
          cookie: context.req.headers.cookie?.toString() ?? "",
        }
      ),
    ]);

    const journey = journeyResponse.meUserJourney;
    if (!journey.hostOnboardingCompleted || !journey.hostId) {
      return {
        redirect: {
          destination: journey.suggestedRoute || "/onboarding-host/host-type",
          permanent: false,
        },
      };
    }

    if (userResponse && userResponse.meUser) {
      const { _id, firstName, status, permissions } = userResponse.meUser;

      const canAccessMenu = hasAccess(
        permissions,
        PermissionTypeEnum.Marketing
      );
      if (!canAccessMenu) {
        return {
          redirect: {
            destination: `/account/access-blocked?target=${PermissionTypeEnum.TeamManagement}`,
            permanent: false,
          },
        };
      }
      return {
        props: {
          repo: {
            _id,
            firstName,
            status,
          },
        },
      };
    } else {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }
  } catch (error) {
    // console.error("Failed to fetch user details:", error);
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
