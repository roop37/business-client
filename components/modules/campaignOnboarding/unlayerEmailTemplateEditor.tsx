import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import useCampaignStore from "@/store/customCampaignStore";
import useTemplateStore from "@/store/customCampaignStore";
import useGlobalStore from "@/store/global";
import useOriginalCampaignStore from "@/store/originalCampaignStore";
import useHostsStore from "@/store/host";
import { validateEmail } from "@/utils/campaignCSVHelpler";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  formatWebsiteUrlClickable,
  isEmailContentValid,
} from "@/utils/utilFUncs";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { EditorRef, EmailEditorProps } from "react-email-editor";

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

const EmailAutoTemplateEditor: React.FC = ({}) => {
  const { setToastData } = useGlobalStore();
  const searchParams = useSearchParams();
  const {
    selectedTemplate,
    setTemplate,
    designJson,
    campaignSubject,
    ctaLink,
    setCtaLink,
    hostOnlineOrderingLink,
  } = useTemplateStore();
  const router = useRouter();
  const { selectedHost, hostLogo, hostAddress } =
    useHostsStore();
  const businessAddress = hostAddress?.addressLine1 || "";
  const [showRules, setShowRules] = useState(false);
  const emailEditorRef = useRef<EditorRef | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const [showAddCta, setShowAddCta] = useState(false);

  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showTestCta, setShowTestCta] = useState(false);
  const [testEmails, setTestEmails] = useState<string>("");
  const [testCtaLink, setTestCtaLink] = useState<string>("");
  const [isTestSendLoading, setIsTestSendLoading] = useState(false);
  const [editorChangeCount, setEditorChangeCount] = useState(0);
  const originalState = useOriginalCampaignStore.getState();
  const currentState = useCampaignStore.getState();
  const isDuplicate = (searchParams?.get("isDuplicate") ?? false) as boolean;

  useEffect(() => {
    const unlayer = emailEditorRef.current?.editor;
    if (unlayer) {
      unlayer.exportHtml((data) => {
        const { html, design } = data;
        const templateJson = JSON.stringify(design);
        setTemplate(selectedTemplate, templateJson, html, "");
      });
    }
  }, [editorChangeCount, selectedTemplate, setTemplate]);

  const onLoad: EmailEditorProps["onLoad"] = (unlayer) => {
    emailEditorRef.current = { editor: unlayer };

    // Modify the design loading logic
    try {
      if (!designJson) return;

      // Parse the designJson only if it exists and is a string
      const parsedDesign =
        typeof designJson === "string" ? JSON.parse(designJson) : designJson;

      unlayer.loadDesign(parsedDesign);
    } catch (error) {
      console.error("Error loading design", error);
    }

    unlayer.addEventListener("design:updated", () => {
      setEditorChangeCount((prev) => prev + 1);
    });

    setIsEditorReady(true);
  };

  const handleSave = async () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    unlayer.exportHtml(async (htmlData) => {
      try {
        const { html, design } = htmlData;
        const { editId } = router.query;
        // Ensure design is stringified
        const templateJson = JSON.stringify(design);

        // Update the local state (keep this if you need it for UI updates)
        setTemplate(
          selectedTemplate,
          templateJson,
          html,
          currentState.content || ""
        );

        let input: any = { campaignId: editId as string };
        // Call the update API with the template data from store
        if (editId) {
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

          if (originalState.ctaLink !== ctaLink) {
            input = { ...input, ctaLink };
          }

          if (Object.keys(input).length > 1) {
            await sdk.updateRestaurantEmailCampaign({ input });
            setToastData({
              type: "success",
              message: "Template saved successfully",
            });
            if (!isDuplicate) {
            useOriginalCampaignStore.setState(currentState);
          }
          }
        } else {
          setToastData({
            type: "warning",
            message: "No campaign ID found. Template saved locally only.",
          });
        }

        // Navigate to next step
        const queryString = searchParams?.toString() ?? "";
        router.push(`template-target?${queryString}`);
      } catch (error) {
        console.error("Error saving template:", error);
        setToastData({
          type: "error",
          message: extractErrorMessage(error) || "Failed to save template",
        });
      }
    });
  };

  const handleTest = async () => {
    try {
      const unlayer = emailEditorRef.current?.editor;
      if (!unlayer) return;

      if ((testEmails?.length ?? 0) <= 0) {
        setToastData({
          message: "Please enter email address to continue",
          type: "error",
        });
        return;
      }

      if (showTestCta && (testCtaLink?.length ?? 0) <= 0) {
        setToastData({
          message: "Please enter CTA link to continue",
          type: "error",
        });
        return;
      }

      if (!validateEmail(testEmails)) {
        setToastData({
          message: "Please enter valid email address to continue",
          type: "error",
        });
        return;
      }

      const urlPattern = new RegExp(
        "^(https?:\\/\\/)" + // protocol
          "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})" + // domain name with TLD
          "(\\:\\d+)?" + // port
          "(\\/[-a-zA-Z\\d%_.~+]*)*" + // path
          "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-zA-Z\\d_]*)?$" // fragment locator
      );

      const formatLink = formatWebsiteUrlClickable(testCtaLink);

      if (showTestCta && !urlPattern.test(formatLink)) {
        setToastData({
          message: "Please enter valid CTA link to continue",
          type: "error",
        });
        return;
      }

      unlayer.exportHtml(async (htmlData) => {
        const { html } = htmlData;

        let processedHtml = html
          .replace(
            /{{hostWebsite}}/g,
            `${hostOnlineOrderingLink}`
          )
          .replace(
            /{{businessWebsite}}/g,
            `${hostOnlineOrderingLink}`
          )
          .replace(/{{hostLogo}}/g, hostLogo || "")
          .replace(/{{businessLogo}}/g, hostLogo || "")
          .replace(/{{restaurantName}}/g, selectedHost || "")
          .replace(/{{businessName}}/g, selectedHost || "")
          .replace(/{{hostAddress}}/g, businessAddress)
          .replace(/{{businessAddress}}/g, businessAddress)
          .replace(/{{eventFlyer}}/g, "")
          .replace(/{{eventUrl}}/g, formatLink || "")
          .replace(/{{promoCode}}/g, "PROMO");

        if (showTestCta && urlPattern.test(formatLink)) {
          processedHtml = processedHtml.replace(/{{buttonLink}}/g, formatLink);
        }

        setIsTestSendLoading(true);
        const res = await sdk.sendTestMarketingEmail({
          input: {
            emails: testEmails,
            html: processedHtml,
            subject: campaignSubject,
          },
        });

        if (res) {
          setIsTestSendLoading(false);
          setShowTestEmail(false);
          setTestCtaLink("");
          setTestEmails("");
          setShowTestCta(false);

          setToastData({
            message: "Test email sent successfully",
            type: "success",
          });
        }
      });
    } catch (error) {
      setIsTestSendLoading(false);
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  return (
    <div className="overflow-y-auto relative h-full">
      <div className="flex align-middle items-center space-x-1">
        <CButton
          variant={ButtonType.Text}
          type="button"
          onClick={() => setShowRules(true)}
          className="m-0 p-0 text-sm"
        >
          Click here
        </CButton>
        <p className="text-sm">
          {"to view the guidelines for using Email Editor"}
        </p>
      </div>
      <div className="flex align-middle items-center space-x-1">
        <p className="text-xs text-gray-500 italic">
          {
            "Note: If you have a button or CTA link in the email, please keep '{{buttonLink}}' as the URL to ensure tracking works. You'll add your actual link when you click on 'continue'."
          }
        </p>
      </div>
      <div className="border border-gray-300 mt-4 mb-6 h-[calc(100vh-220px)] w-full">
        <EmailEditor
          ref={emailEditorRef}
          options={{
            id: "editor-container",
            displayMode: "email",
            features: {
              preview: true,
            },
            mergeTags: {
              businessLogo: {
                name: "Venue Logo",
                value: "{{businessLogo}}",
                sample: hostLogo,
              },
              hostName: {
                name: "Venue Name",
                value: "{{businessName}}",
                sample: selectedHost,
              },
              businessAddress: {
                name: "Venue Address",
                value: "{{businessAddress}}",
                sample: businessAddress,
              },
              customerName: {
                name: "Customer Name",
                value: "{{customerName}}",
              },
              eventFlyer: {
                name: "Event Flyer",
                value: "{{eventFlyer}}",
              },
              eventUrl: {
                name: "Event Link",
                value: "{{eventUrl}}",
              },
              promoCode: {
                name: "Promo Code",
                value: "{{promoCode}}",
              },
              buttonLink: {
                name: "Button Link",
                value: "{{buttonLink}}",
              },
              // emailUnsubscribeLink: {
              //   name: "Unsubscribe Link",
              //   value: "{{emailUnsubscribeLink}}",
              // },
            },
            fonts: {
              customFonts: [
                {
                  label: "Lobster Two",
                  value: "'Lobster Two',cursive",
                  url: "https://fonts.googleapis.com/css?family=Lobster+Two:400,700",
                },
                {
                  label: "Playfair Display",
                  value: "'Playfair Display',serif",
                  url: "https://fonts.googleapis.com/css?family=Playfair+Display:400,700",
                },
                {
                  label: "Rubik",
                  value: "'Rubik',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Rubik:400,700",
                },
                {
                  label: "Source Sans Pro",
                  value: "'Source Sans Pro',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700",
                },
                {
                  label: "Open Sans",
                  value: "'Open Sans',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Open+Sans:400,700",
                },
                {
                  label: "Crimson Text",
                  value: "'Crimson Text',serif",
                  url: "https://fonts.googleapis.com/css?family=Crimson+Text:400,700",
                },
                {
                  label: "Montserrat",
                  value: "'Montserrat',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Montserrat:400,700",
                },
                {
                  label: "Old Standard TT",
                  value: "'Old Standard TT',serif",
                  url: "https://fonts.googleapis.com/css?family=Old+Standard+TT:400,700",
                },
                {
                  label: "Lato",
                  value: "'Lato',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Lato:400,700",
                },
                {
                  label: "Raleway",
                  value: "'Raleway',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Raleway:400,700",
                },
                {
                  label: "Cabin",
                  value: "'Cabin',sans-serif",
                  url: "https://fonts.googleapis.com/css?family=Cabin:400,700",
                },
                {
                  label: "Pacifico",
                  value: "'Pacifico',cursive",
                  url: "https://fonts.googleapis.com/css?family=Pacifico",
                },
              ],
              showDefaultFonts: true,
            },
            appearance: {
              theme: "modern_light",
            },
          }}
          //  onChange={() => setEditorChangeCount(prev => prev + 1)}
          onLoad={onLoad}
          minHeight={"100%"}
        />
      </div>
      <div className="text-center flex justify-end space-x-4">
        <CButton
          variant={ButtonType.Secondary}
          onClick={() => {
            const unlayer = emailEditorRef.current?.editor;
            if (!unlayer) return;

            unlayer.exportPlainText((plainTextData) => {
              const { text } = plainTextData;
              if (text.includes("buttonLink")) {
                setShowTestCta(true);
              } else {
                setShowTestCta(false);
              }
              setShowTestEmail(true);
            });
          }}
          disabled={!isEditorReady}
        >
          Test Email
        </CButton>
        <CButton
          variant={ButtonType.Primary}
          onClick={() => {
            const unlayer = emailEditorRef.current?.editor;
            if (!unlayer) return;

            unlayer.exportPlainText((plainTextData) => {
              const { design } = plainTextData;

              // if (
              //   design.body.rows.length <= 0 ||
              //   design.body.rows.some((e) =>
              //     e.columns.some((c) => c.contents.length <= 0)
              //   )
              // ) {
              // setToastData({
              //   type: "error",
              //   message: "Email content cannot be empty",
              // });
              // return;
              // }
              if (!isEmailContentValid(design)) {
                setToastData({
                  type: "error",
                  message: "Email content cannot be empty",
                });
                return;
              }

              if (JSON.stringify(design.body.rows).includes("buttonLink")) {
                setShowAddCta(true);
              } else {
                handleSave();
              }
            });
          }}
          disabled={!isEditorReady}
        >
          Continue
        </CButton>
      </div>
      <ReusableModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        title="Email Editor"
        width="lg"
      >
        <div className="py-4 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">
            Important Guidelines
          </h3>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">
              What are Merge Tags?
            </h4>
            <p className="text-sm text-gray-600">{`When creating emails, you can use special tags that automatically fill in information. Think of these as placeholders that get replaced with real information when the email is sent.`}</p>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-1">
              Available Tags and How to Use Them
            </h4>
            <p className="text-sm text-gray-600 mb-2">{`To use these tags, copy and paste them exactly as shown (including the curly brackets):`}</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>
                <strong>To show your logo:</strong>{" "}
                <code className="bg-gray-100 text-gray-800 px-1 rounded">
                  {`{{businessLogo}}`}
                </code>
              </li>
              <li>
                <strong>To show your venue name:</strong>{" "}
                <code className="bg-gray-100 text-gray-800 px-1 rounded">
                  {`{{businessName}}`}
                </code>
              </li>
              <li>
                <strong>To show venue address:</strong>{" "}
                <code className="bg-gray-100 text-gray-800 px-1 rounded">
                  {`{{businessAddress}}`}
                </code>
              </li>
              <li>
                <strong>{`To show the customer's name:`}</strong>{" "}
                <code className="bg-gray-100 text-gray-800 px-1 rounded">
                  {`{{customerName}}`}
                </code>
              </li>
              <li>
                <strong>{`For event links or clickable buttons:`}</strong>{" "}
                <code className="bg-gray-100 text-gray-800 px-1 rounded">
                  {`{{buttonLink}}`}
                </code>
              </li>
              <li>
                <strong>{`For event flyers:`}</strong>{" "}
                <code className="bg-gray-100 text-gray-800 px-1 rounded">
                  {`{{eventFlyer}}`}
                </code>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">
              Important Note About Links:
            </h4>
            <p className="text-sm text-gray-600">
              {`When creating a clickable button / link in your email, always use {{buttonLink}} as the url. You'll be able to add the actual website url in the next step. This helps us track button / link clicks.`}
            </p>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">
              Design Tips:
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Use consistent colors and fonts throughout your email.</li>
              <li>Keep your message short and clear.</li>
              <li>Make sure all your links work correctly.</li>
              <li>
                Always preview your email on both computer and phone screens
                before sending.
              </li>
            </ul>
          </div>
        </div>
      </ReusableModal>

      <ReusableModal
        isOpen={showTestEmail}
        onClose={() => {
          setShowTestEmail(false);
          setTestCtaLink("");
          setTestEmails("");
          setShowTestCta(false);
        }}
        title="Send Test Email"
        width="ml"
      >
        <div className="pt-2 space-y-6">
          <div className="mb-4">
            <label
              htmlFor="test-email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Test Email
            </label>
            <input
              id="test-email"
              type="text"
              value={testEmails}
              onChange={(e) => {
                setTestEmails(e.target.value);
              }}
              placeholder="Enter email address to send a test email"
              className="input input-primary"
            />
          </div>
          {showTestCta ? (
            <div className="mb-4">
              <label
                htmlFor="test-cta-link"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                CTA Link (Button link)
              </label>
              <input
                id="test-cta-link"
                type="text"
                value={testCtaLink}
                onChange={(e) => {
                  setTestCtaLink(e.target.value);
                }}
                placeholder="https://example.com"
                className="input input-primary"
              />
            </div>
          ) : null}
          <div className="text-center flex justify-end space-x-4">
            <CButton
              variant={ButtonType.Primary}
              onClick={handleTest}
              disabled={!isEditorReady || isTestSendLoading}
              loading={isTestSendLoading}
            >
              Send
            </CButton>
          </div>
        </div>
      </ReusableModal>

      <ReusableModal
        isOpen={showAddCta}
        onClose={() => {
          setShowAddCta(false);
        }}
        title="Add Actual Link"
        width="ml"
      >
        <div className="pt-2 space-y-6">
          <div className="mb-4">
            <label
              htmlFor="cta-link"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              CTA Link (Button link)
            </label>
            <input
              id="cta-link"
              type="text"
              value={ctaLink}
              onChange={(e) => {
                setCtaLink(e.target.value);
              }}
              placeholder="https://example.com"
              className="input input-primary"
            />
            <p className="text-xs text-gray-500 mt-2">
              {`Default host link: ${hostOnlineOrderingLink}/menu`}
            </p>
          </div>
          <div className="text-center flex justify-end space-x-4">
            <CButton
              variant={ButtonType.Primary}
              onClick={() => {
                const urlPattern = new RegExp(
                  "^(https?:\\/\\/)" + // protocol
                    "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})" + // domain name with TLD
                    "(\\:\\d+)?" + // port
                    "(\\/[-a-zA-Z\\d%_.~+]*)*" + // path
                    "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // query string
                    "(\\#[-a-zA-Z\\d_]*)?$" // fragment locator
                );

                if (!urlPattern.test(ctaLink)) {
                  setToastData({
                    message: "Please enter valid CTA link to continue",
                    type: "error",
                  });
                  return;
                }

                setCtaLink(ctaLink);

                handleSave();
              }}
              disabled={!isEditorReady}
            >
              Continue
            </CButton>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default EmailAutoTemplateEditor;
