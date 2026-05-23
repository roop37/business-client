import useHostsStore from "@/store/host";
import { parseHtmlWithValues } from "@/utils/utilFUncs";
import DOMPurify from "dompurify";
import React, { useEffect, useState } from "react";

interface EmailTemplatePreviewProps {
  html?: string;
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  html,
}) => {
  const { selectedHost, hostLogo, hostAddress } =
    useHostsStore();

  const [htmlParsed, setHtmlParsed] = useState<string>();

  useEffect(() => {
    const parseTemplate = async (template: string) => {
      const templateParsed = parseHtmlWithValues(
        template,
        {
          hostLogo: hostLogo ?? "",
          hostName: selectedHost ?? "",
          hostAddress: hostAddress?.addressLine1 ?? "",
        },
        ["hostLogo", "restaurantName", "hostAddress"]
      );

      DOMPurify.addHook("uponSanitizeElement", (node) => {
        if (node.nodeType === 3 && /{{.+?}}/.test(node.nodeValue || "")) {
          // If the node contains `{{variable}}`, preserve it
          node.nodeValue = node.nodeValue;
        }
      });

      const sanitizedHtml = DOMPurify.sanitize(templateParsed);

      setHtmlParsed(sanitizedHtml);
    };

    if (html && html.trim().length > 0) {
      parseTemplate(html);
    } else {
      setHtmlParsed(undefined);
    }
  }, [html, hostAddress, hostLogo, selectedHost]);

  if (!htmlParsed) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="text-gray-500 text-center p-4">
          No email template selected
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center h-full">
      <div className="w-full overflow-auto border-l border-gray-300 shadow-lg h-full">
        <div
          dangerouslySetInnerHTML={{ __html: htmlParsed }}
          className="cursor-default pointer-events-none"
        />
      </div>
    </div>
  );
};

export default EmailTemplatePreview;
