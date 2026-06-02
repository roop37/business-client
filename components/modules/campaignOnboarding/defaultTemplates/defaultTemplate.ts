import engageActiveCustomers from "./engage-customers";
import eventInvitation from "./event-invite";
import rewardTopSpenders from "./reward-top-spenders";
import sendAnOffer from "./send-an-offer";

type TemplatePayload = {
  html: string;
  json: any;
};

const eventFlyerHtml = `<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 480px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 480px;display: table-cell;vertical-align: top;">
        <div style="box-sizing: border-box; height: 100%; padding: 0px 10px 12px;">
          <a href="{{eventUrl}}" target="_blank">
            <img align="center" border="0" src="{{eventFlyer}}" alt="Event flyer" title="Event flyer" style="outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;clear:both;display:block!important;border:none;height:auto;float:none;width:100%;max-width:460px;border-radius:12px;" width="460"/>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>`;

const createEventFlyerRow = () => ({
  id: "hoizr_event_flyer_row",
  cells: [1],
  columns: [
    {
      id: "hoizr_event_flyer_column",
      contents: [
        {
          id: "hoizr_event_flyer_image",
          type: "image",
          values: {
            containerPadding: "0px 10px 12px",
            anchor: "",
            src: {
              url: "{{eventFlyer}}",
              width: 1200,
              height: 675,
              autoWidth: false,
              maxWidth: "100%",
            },
            textAlign: "center",
            altText: "Event flyer",
            action: {
              name: "web",
              values: { href: "{{eventUrl}}", target: "_blank" },
              attrs: { href: "{{href}}", target: "{{target}}" },
            },
            border: {},
            borderRadius: "12px",
            _meta: {
              htmlID: "hoizr_event_flyer_image",
              htmlClassNames: "u_content_image",
            },
            selectable: true,
            draggable: true,
            duplicatable: true,
            deletable: true,
            hideable: true,
          },
        },
      ],
      values: {
        backgroundColor: "",
        padding: "0px",
        border: {},
        borderRadius: "0px",
        _meta: { htmlID: "hoizr_event_flyer_column", htmlClassNames: "u_column" },
      },
    },
  ],
  values: {
    displayCondition: null,
    columns: false,
    backgroundColor: "",
    columnsBackgroundColor: "#ffffff",
    backgroundImage: {
      url: "",
      fullWidth: true,
      repeat: "no-repeat",
      size: "custom",
      position: "center",
    },
    padding: "0px",
    anchor: "",
    hideDesktop: false,
    _meta: { htmlID: "hoizr_event_flyer_row", htmlClassNames: "u_row" },
    selectable: true,
    draggable: true,
    duplicatable: true,
    deletable: true,
    hideable: true,
  },
});

const withEventFlyer = (template: { html: string; json: any }) => {
  const json = JSON.parse(JSON.stringify(template.json));
  json.body.rows.splice(1, 0, createEventFlyerRow());
  return {
    html: template.html.replace(
      '<div class="u-row-container"',
      `${eventFlyerHtml}\n<div class="u-row-container"`
    ),
    json,
  };
};

const createTemplateVariant = (
  template: TemplatePayload,
  replacements: Array<[string, string]>
) => {
  const replaceAll = (value: string) =>
    replacements.reduce(
      (current, [from, to]) => current.split(from).join(to),
      value
    );

  return {
    html: replaceAll(template.html),
    json: JSON.parse(replaceAll(JSON.stringify(template.json))),
  };
};

const eventPromotion = withEventFlyer(eventInvitation);
const eventInvitationWithFlyer = withEventFlyer(eventInvitation);
const lastCallTicketDrop = createTemplateVariant(withEventFlyer(sendAnOffer), [
  [
    "We have something special for you today! Enjoy 10% off on your next booking with us. Valid for 7 days.",
    "A fresh ticket drop is live for {{eventTitle}}. Push this to your hottest audience when tables, guestlist, or early-bird passes need one clean nudge before the room fills up.",
  ],
  [
    "Use <strong>{{promoCode}}</strong> at checkout.",
    "Use <strong>{{promoCode}}</strong> before the window closes and send your crew straight to checkout.",
  ],
  ["View event", "Claim the drop"],
]);
const weekendTicketRush = createTemplateVariant(eventPromotion, [
  [
    "We're hosting <strong>Event Name</strong> at {{businessName}}, and we'd love for you to join us!",
    "<strong>{{eventTitle}}</strong> is built for a packed weekend: high-intent fans, one clear flyer, and a direct path to tickets.",
  ],
  ["Event Details:", "Campaign angle:"],
  [
    "<strong>When:</strong> Event Date &amp; Time",
    "<strong>Hook:</strong> Limited-capacity night with a strong reason to book now",
  ],
  [
    "<strong>What to Expect:</strong> About event",
    "<strong>Push:</strong> Spotlight the lineup, offer, door policy, or fastest-selling ticket tier.",
  ],
  [
    "Looking forward to seeing you!",
    "Keep the CTA direct and let the flyer do the heavy lifting.",
  ],
  ["Your {{businessName}} Team", "{{businessName}}"],
  ["View event", "Book tickets"],
]);
const bollywoodNightDrop = createTemplateVariant(eventInvitationWithFlyer, [
  [
    "We're hosting <strong>Event Name</strong> at {{businessName}}, and we'd love for you to join us!",
    "<strong>{{eventTitle}}</strong> is the Bollywood night your group chat needs: big hooks, bigger sing-alongs, and one easy ticket link.",
  ],
  ["Event Details:", "Drop details:"],
  [
    "<strong>When:</strong> Event Date &amp; Time",
    "<strong>For:</strong> friends planning the weekend, reels-first crews, and fans who book when the vibe is clear",
  ],
  [
    "<strong>What to Expect:</strong> About event",
    "<strong>Expect:</strong> dance-floor energy, photo moments, fast guestlist movement, and a strong last-click CTA.",
  ],
  [
    "Looking forward to seeing you!",
    "Send this before the playlist starts doing the selling for you.",
  ],
  ["Your {{businessName}} Team", "{{businessName}} crew"],
  ["View event", "Lock the plan"],
]);
const campusCrewGuestlist = createTemplateVariant(lastCallTicketDrop, [
  [
    "A fresh ticket drop is live for {{eventTitle}}. Push this to your hottest audience when tables, guestlist, or early-bird passes need one clean nudge before the room fills up.",
    "{{eventTitle}} is live for the college crew: one flyer, one code, and a clear reason to sort the plan before everyone else does.",
  ],
  [
    "Use <strong>{{promoCode}}</strong> before the window closes and send your crew straight to checkout.",
    "Use <strong>{{promoCode}}</strong>, share it in the group chat, and move from maybe to booked.",
  ],
  ["Claim the drop", "Unlock guestlist"],
]);

export const defaultTemplates = [
  {
    name: "Clean Slate",
    description: "Start from a blank campaign and build the email yourself.",
    template: {
      content: "",
      designJson: {
        counters: {
          u_row: 13,
          u_column: 16,
          u_content_menu: 3,
          u_content_text: 11,
          u_content_image: 3,
          u_content_button: 4,
          u_content_social: 1,
          u_content_divider: 6,
        },
        body: {
          id: "GVbmjVM0P1",
          rows: [
            {
              id: "lVA_s9MM7v",
              cells: [1],
              columns: [
                {
                  id: "fLAZxC3_Fu",
                  contents: [
                    {
                      id: "ZvnQz_NTzr",
                      type: "image",
                      values: {
                        containerPadding: "0px",
                        anchor: "",
                        src: {
                          url: "{{businessLogo}}",
                          width: 1080,
                          height: 339,
                          autoWidth: false,
                          maxWidth: "30%",
                        },
                        textAlign: "center",
                        altText: "",
                        action: {
                          name: "web",
                          values: {
                            href: "{{businessWebsite}}",
                            target: "_blank",
                          },
                          attrs: { href: "{{href}}", target: "{{target}}" },
                        },
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_image_8",
                          htmlClassNames: "u_content_image",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        pending: false,
                      },
                    },
                    {
                      id: "947rXk9iE_",
                      type: "divider",
                      values: {
                        width: "100%",
                        border: {
                          borderTopWidth: "1px",
                          borderTopStyle: "solid",
                          borderTopColor: "#BBBBBB",
                        },
                        textAlign: "center",
                        containerPadding: "10px",
                        anchor: "",
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_divider_6",
                          htmlClassNames: "u_content_divider",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                      },
                    },
                    {
                      id: "nlERe8Ci2s",
                      type: "text",
                      values: {
                        containerPadding: "10px 10px 24px",
                        anchor: "",
                        fontSize: "14px",
                        textAlign: "left",
                        lineHeight: "140%",
                        linkStyle: {
                          inherit: true,
                          linkColor: "#0000ee",
                          linkHoverColor: "#0000ee",
                          linkUnderline: true,
                          linkHoverUnderline: true,
                        },
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_text_12",
                          htmlClassNames: "u_content_text",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        text: '<p style="line-height: 140%;">Hello {{customerName}},<br /><br />You\'ve spent over <strong>$150</strong> in the past 30 days, and we want to say thank you with a special reward. Use the code below during checkout to enjoy your reward.</p>',
                        _languages: {},
                      },
                    },
                  ],
                  values: {
                    backgroundColor: "",
                    padding: "10px",
                    border: {
                      borderTopWidth: "0px",
                      borderTopStyle: "solid",
                      borderTopColor: "#CCC",
                      borderLeftWidth: "0px",
                      borderLeftStyle: "solid",
                      borderLeftColor: "#CCC",
                      borderRightWidth: "0px",
                      borderRightStyle: "solid",
                      borderRightColor: "#CCC",
                      borderBottomWidth: "0px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#CCC",
                    },
                    borderRadius: "0px",
                    _meta: {
                      htmlID: "u_column_23",
                      htmlClassNames: "u_column",
                    },
                  },
                },
              ],
              values: {
                displayCondition: null,
                columns: false,
                _styleGuide: null,
                backgroundColor: "",
                columnsBackgroundColor: "#ffffff",
                backgroundImage: {
                  url: "",
                  fullWidth: true,
                  repeat: "no-repeat",
                  size: "custom",
                  position: "center",
                },
                padding: "0px",
                anchor: "",
                hideDesktop: false,
                _meta: { htmlID: "u_row_15", htmlClassNames: "u_row" },
                selectable: true,
                draggable: true,
                duplicatable: true,
                deletable: true,
                hideable: true,
              },
            },
            {
              id: "TBUiyT6D4j",
              cells: [23.33, 53.33, 23.34],
              columns: [
                {
                  id: "8WhUYQF8XA",
                  contents: [],
                  values: {
                    backgroundColor: "",
                    padding: "0px",
                    border: {},
                    borderRadius: "0px",
                    _meta: {
                      htmlID: "u_column_28",
                      htmlClassNames: "u_column",
                    },
                  },
                },
                {
                  id: "ayneX96pn_",
                  contents: [
                    {
                      id: "bxWDnFRZkf",
                      type: "heading",
                      values: {
                        containerPadding: "10px",
                        anchor: "",
                        headingType: "h1",
                        fontSize: "24px",
                        textAlign: "center",
                        lineHeight: "140%",
                        linkStyle: {
                          inherit: true,
                          linkColor: "#0000ee",
                          linkHoverColor: "#0000ee",
                          linkUnderline: true,
                          linkHoverUnderline: true,
                        },
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_heading_4",
                          htmlClassNames: "u_content_heading",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        text: "<span>VIPACCESS</span>",
                        _languages: {},
                      },
                    },
                  ],
                  values: {
                    backgroundColor: "#f0f0f0",
                    padding: "0px",
                    border: {
                      borderTopWidth: "0px",
                      borderTopStyle: "solid",
                      borderTopColor: "#CCC",
                      borderLeftWidth: "0px",
                      borderLeftStyle: "solid",
                      borderLeftColor: "#CCC",
                      borderRightWidth: "0px",
                      borderRightStyle: "solid",
                      borderRightColor: "#CCC",
                      borderBottomWidth: "0px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#CCC",
                    },
                    borderRadius: "0px",
                    _meta: {
                      htmlID: "u_column_29",
                      htmlClassNames: "u_column",
                    },
                  },
                },
                {
                  id: "XPe21etY6f",
                  contents: [],
                  values: {
                    backgroundColor: "",
                    padding: "0px",
                    border: {},
                    borderRadius: "0px",
                    _meta: {
                      htmlID: "u_column_30",
                      htmlClassNames: "u_column",
                    },
                  },
                },
              ],
              values: {
                displayCondition: null,
                columns: false,
                _styleGuide: null,
                backgroundColor: "",
                columnsBackgroundColor: "#ffffff",
                backgroundImage: {
                  url: "",
                  fullWidth: true,
                  repeat: "no-repeat",
                  size: "custom",
                  position: "center",
                },
                padding: "0px",
                anchor: "",
                hideDesktop: false,
                _meta: { htmlID: "u_row_16", htmlClassNames: "u_row" },
                selectable: true,
                draggable: true,
                duplicatable: true,
                deletable: true,
                hideable: true,
              },
            },
            {
              id: "D_-jKRR9FO",
              cells: [1],
              columns: [
                {
                  id: "OH2rmgc3zL",
                  contents: [
                    {
                      id: "AFNX1wfCon",
                      type: "button",
                      values: {
                        href: {
                          name: "web",
                          attrs: { href: "{{href}}", target: "{{target}}" },
                          values: {
                            href: "{{buttonLink}}",
                            target: "_blank",
                          },
                        },
                        buttonColors: {
                          color: "{{backgroundColor}}",
                          backgroundColor: "{{primaryColor}}",
                          hoverColor: "#FFFFFF",
                          hoverBackgroundColor: "#3AAEE0",
                        },
                        size: { autoWidth: false, width: "100%" },
                        fontSize: "14px",
                        lineHeight: "120%",
                        textAlign: "center",
                        padding: "10px 20px",
                        border: {},
                        borderRadius: "4px",
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        containerPadding: "24px 10px 12px",
                        anchor: "",
                        _meta: {
                          htmlID: "u_content_button_13",
                          htmlClassNames: "u_content_button",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        text: '<span style="line-height: 16.8px;">View event</span>',
                        _languages: {},
                        calculatedWidth: 440,
                        calculatedHeight: 37,
                      },
                    },
                    {
                      id: "UsBhgY1Jjb",
                      type: "divider",
                      values: {
                        width: "100%",
                        border: {
                          borderTopWidth: "1px",
                          borderTopStyle: "solid",
                          borderTopColor: "#BBBBBB",
                        },
                        textAlign: "center",
                        containerPadding: "10px",
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_divider_7",
                          htmlClassNames: "u_content_divider",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                      },
                    },
                    {
                      id: "1tjvTGEQzg",
                      type: "social",
                      values: {
                        containerPadding: "15px 10px 10px",
                        anchor: "",
                        icons: {
                          iconType: "circle",
                          icons: [
                            { name: "Facebook", url: "https://facebook.com" },
                            { name: "Instagram", url: "https://instagram.com" },
                          ],
                          editor: {
                            data: {
                              showDefaultIcons: true,
                              showDefaultOptions: true,
                              customIcons: [],
                              customOptions: [],
                            },
                          },
                        },
                        align: "center",
                        iconSize: 18,
                        spacing: 12,
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_social_5",
                          htmlClassNames: "u_content_social",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                      },
                    },
                    {
                      id: "sfl7J4m7Q1",
                      type: "text",
                      values: {
                        containerPadding: "10px",
                        anchor: "",
                        fontSize: "12px",
                        color: "#aaaaaa",
                        textAlign: "center",
                        lineHeight: "140%",
                        linkStyle: {
                          inherit: true,
                          linkColor: "#0000ee",
                          linkHoverColor: "#0000ee",
                          linkUnderline: true,
                          linkHoverUnderline: true,
                        },
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_text_13",
                          htmlClassNames: "u_content_text",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        text: '<p style="line-height: 140%;">{{businessName}}<br />{{businessAddress}}</p>',
                        _languages: {},
                      },
                    },
                    {
                      id: "7ECWKut5zT",
                      type: "text",
                      values: {
                        containerPadding: "0px 10px",
                        anchor: "",
                        fontSize: "12px",
                        color: "#aaaaaa",
                        textAlign: "center",
                        lineHeight: "140%",
                        linkStyle: {
                          inherit: true,
                          linkColor: "#0000ee",
                          linkHoverColor: "#0000ee",
                          linkUnderline: true,
                          linkHoverUnderline: true,
                        },
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_text_14",
                          htmlClassNames: "u_content_text",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        text: '<p style="line-height: 140%;">You received this email because you are a valued customer of {{businessName}}. If you wish to unsubscribe, please click <a style="color: {{primaryColor}};" rel="noopener" href="{{emailUnsubscribeLink}}" target="_blank" data-u-link-value="eyJuYW1lIjoid2ViIiwiYXR0cnMiOnsiaHJlZiI6Int7aHJlZn19IiwidGFyZ2V0Ijoie3t0YXJnZXR9fSJ9LCJ2YWx1ZXMiOnsiaHJlZiI6Int7ZW1haWxVbnN1YnNjcmliZUxpbmt9fSIsInRhcmdldCI6Il9ibGFuayJ9fQ==">here</a>.</p>',
                        _languages: {},
                      },
                    },
                    {
                      id: "rnWnFwy2_4",
                      type: "text",
                      values: {
                        containerPadding: "10px",
                        anchor: "",
                        fontSize: "12px",
                        color: "#aaaaaa",
                        textAlign: "center",
                        lineHeight: "140%",
                        linkStyle: {
                          inherit: true,
                          linkColor: "#0000ee",
                          linkHoverColor: "#0000ee",
                          linkUnderline: true,
                          linkHoverUnderline: true,
                        },
                        hideDesktop: false,
                        displayCondition: null,
                        _styleGuide: null,
                        _meta: {
                          htmlID: "u_content_text_15",
                          htmlClassNames: "u_content_text",
                        },
                        selectable: true,
                        draggable: true,
                        duplicatable: true,
                        deletable: true,
                        hideable: true,
                        text: '<p style="line-height: 140%;">Need help? Reach out to us by clicking <a style="color: {{primaryColor}};" rel="noopener" href="mailto:contact@hoizr.com" target="_blank" data-u-link-value="eyJuYW1lIjoiZW1haWwiLCJhdHRycyI6eyJocmVmIjoibWFpbHRvOnt7ZW1haWx9fT9zdWJqZWN0PXt7c3ViamVjdH19JmJvZHk9e3tib2R5fX0ifSwidmFsdWVzIjp7ImVtYWlsIjoic3VwcG9ydEBjaG9vc2Vwb3MuY29tIiwic3ViamVjdCI6IiIsImJvZHkiOiIifX0=">here</a>.</p>',
                        _languages: {},
                      },
                    },
                  ],
                  values: {
                    backgroundColor: "",
                    padding: "10px",
                    border: {
                      borderTopWidth: "0px",
                      borderTopStyle: "solid",
                      borderTopColor: "#CCC",
                      borderLeftWidth: "0px",
                      borderLeftStyle: "solid",
                      borderLeftColor: "#CCC",
                      borderRightWidth: "0px",
                      borderRightStyle: "solid",
                      borderRightColor: "#CCC",
                      borderBottomWidth: "0px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#CCC",
                    },
                    borderRadius: "0px",
                    _meta: {
                      htmlID: "u_column_31",
                      htmlClassNames: "u_column",
                    },
                  },
                },
              ],
              values: {
                displayCondition: null,
                columns: false,
                _styleGuide: null,
                backgroundColor: "",
                columnsBackgroundColor: "#ffffff",
                backgroundImage: {
                  url: "",
                  fullWidth: true,
                  repeat: "no-repeat",
                  size: "custom",
                  position: "center",
                },
                padding: "0px",
                anchor: "",
                hideDesktop: false,
                _meta: { htmlID: "u_row_17", htmlClassNames: "u_row" },
                selectable: true,
                draggable: true,
                duplicatable: true,
                deletable: true,
                hideable: true,
              },
            },
          ],
          headers: [],
          footers: [],
          values: {
            _styleGuide: null,
            popupPosition: "center",
            popupWidth: "600px",
            popupHeight: "auto",
            borderRadius: "10px",
            contentAlign: "center",
            contentVerticalAlign: "center",
            contentWidth: "600px",
            fontFamily: {
              label: "Montserrat",
              value: "'Montserrat',sans-serif",
              url: "https://fonts.googleapis.com/css?family=Montserrat:400,700",
              defaultFont: true,
            },
            textColor: "#000000",
            popupBackgroundColor: "#FFFFFF",
            popupBackgroundImage: {
              url: "",
              fullWidth: true,
              repeat: "no-repeat",
              size: "cover",
              position: "center",
            },
            popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
            popupCloseButton_position: "top-right",
            popupCloseButton_backgroundColor: "#DDDDDD",
            popupCloseButton_iconColor: "#000000",
            popupCloseButton_borderRadius: "0px",
            popupCloseButton_margin: "0px",
            popupCloseButton_action: {
              name: "close_popup",
              attrs: {
                onClick:
                  "document.querySelector('.u-popup-container').style.display = 'none';",
              },
            },
            language: {},
            backgroundColor: "#f7f8f9",
            preheaderText: "",
            linkStyle: {
              body: true,
              linkColor: "#0000ee",
              linkHoverColor: "#0000ee",
              linkUnderline: true,
              linkHoverUnderline: true,
            },
            backgroundImage: {
              url: "",
              fullWidth: true,
              repeat: "no-repeat",
              size: "custom",
              position: "top-center",
              customPosition: ["50%", "0%"],
            },
            _meta: { htmlID: "u_body", htmlClassNames: "u_body" },
          },
        },
        schemaVersion: 17,
      },
      html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <title></title>
  
    <style type="text/css">
      
      @media only screen and (min-width: 500px) {
        .u-row {
          width: 480px !important;
        }

        .u-row .u-col {
          vertical-align: top;
        }

        
            .u-row .u-col-100 {
              width: 480px !important;
            }
          
      }

      @media only screen and (max-width: 500px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }

        .u-row {
          width: 100% !important;
        }

        .u-row .u-col {
          display: block !important;
          width: 100% !important;
          min-width: 320px !important;
          max-width: 100% !important;
        }

        .u-row .u-col > div {
          margin: 0 auto;
        }


        .u-row .u-col img {
          max-width: 100% !important;
        }

}
    
body{margin:0;padding:0}table,td,tr{border-collapse:collapse;vertical-align:top}p{margin:0}.ie-container table,.mso-container table{table-layout:fixed}*{line-height:inherit}a[x-apple-data-detectors=true]{color:inherit!important;text-decoration:none!important}


table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: none; }
    </style>
  
  

<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f0f0f0;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f0f0f0;width:100%" cellpadding="0" cellspacing="0">
  <tbody>
  <tr style="vertical-align: top">
    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f0f0f0;"><![endif]-->
    
  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 480px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px;"><tr style="background-color: #ffffff;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="480" style="width: 480px;padding: 10px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 480px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 10px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding-right: 0px;padding-left: 0px;" align="center">
      <a href="{{businessWebsite}}" target="_blank">
      <img align="center" border="0" src="{{businessLogo}}" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 30%;max-width: 144px;" width="144"/>
      </a>
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 480px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:480px;"><tr style="background-color: #ffffff;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="480" style="width: 480px;padding: 10px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 480px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 10px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 10px 10px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
<div align="center" style="direction: ltr;">
  <div style="display: table; max-width:59px;">
  <!--[if (mso)|(IE)]><table width="59" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:59px;"><tr><![endif]-->
  
    
    <!--[if (mso)|(IE)]><td width="18" style="width:18px; padding-right: 12px;" valign="top"><![endif]-->
    <table border="0" cellspacing="0" cellpadding="0" width="18" height="18" style="width: 18px !important;height: 18px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 12px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://facebook.com" title="Facebook" target="_blank">
          <img src="https://cdn.tools.unlayer.com/social/icons/circle/facebook.png" alt="Facebook" title="Facebook" width="18" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 18px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    <!--[if (mso)|(IE)]><td width="18" style="width:18px; padding-right: 0px;" valign="top"><![endif]-->
    <table border="0" cellspacing="0" cellpadding="0" width="18" height="18" style="width: 18px !important;height: 18px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
      <tbody><tr style="vertical-align: top"><td valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <a href="https://instagram.com" title="Instagram" target="_blank">
          <img src="https://cdn.tools.unlayer.com/social/icons/circle/instagram.png" alt="Instagram" title="Instagram" width="18" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 18px !important">
        </a>
      </td></tr>
    </tbody></table>
    <!--[if (mso)|(IE)]></td><![endif]-->
    
    
    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
  </div>
</div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
  <div style="font-size: 12px; color: #aaaaaa; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;">{{businessName}}<br />{{businessAddress}}</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
  <div style="font-size: 12px; color: #aaaaaa; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;">You received this email because you are a valued customer of {{businessName}}. If you wish to unsubscribe, please click <a rel="noopener" href="{{emailUnsubscribeLink}}" target="_blank">here</a>.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:'Source Sans Pro',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Source Sans Pro',sans-serif;" align="left">
        
  <div style="font-size: 12px; color: #aaaaaa; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;">Need help? Reach out to us by clicking <a rel="noopener" href="mailto:contact@hoizr.com" target="_blank">here</a>.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
    </td>
  </tr>
  </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
  <!--[if IE]></div><![endif]-->
</body>

</html>
      `,
    },
  },
  {
    name: "Reward Top Spender",
    description:
      "Thank your highest-value fans with a dedicated reward campaign.",
    template: {
      content: "",
      designJson: rewardTopSpenders.json,
      html: rewardTopSpenders.html,
    },
  },
  {
    name: "Offer Promo Code",
    description:
      "Send a limited-time offer with a promo code such as {{promoCode}}.",
    template: {
      content: "",
      designJson: sendAnOffer.json,
      html: sendAnOffer.html,
    },
  },
  {
    name: "Last-Call Ticket Drop",
    description:
      "A bold flyer-led push for urgent ticket, table, or guestlist conversion.",
    template: {
      content: "",
      designJson: lastCallTicketDrop.json,
      html: lastCallTicketDrop.html,
    },
  },
  {
    name: "Weekend Ticket Rush",
    description:
      "A high-energy event promo built around urgency, flyer recall, and ticket clicks.",
    template: {
      content: "",
      designJson: weekendTicketRush.json,
      html: weekendTicketRush.html,
    },
  },
  {
    name: "Bollywood Night Drop",
    description:
      "India Gen-Z event copy for Bollywood, DJ, club, and afterparty campaigns.",
    template: {
      content: "",
      designJson: bollywoodNightDrop.json,
      html: bollywoodNightDrop.html,
    },
  },
  {
    name: "Campus Crew Guestlist",
    description:
      "A youth-focused guestlist or promo-code push for college and group-chat audiences.",
    template: {
      content: "",
      designJson: campusCrewGuestlist.json,
      html: campusCrewGuestlist.html,
    },
  },
  {
    name: "Event Promotion",
    description:
      "Promote an upcoming event with the flyer, ticket link, and lineup context.",
    template: {
      content: "",
      designJson: eventPromotion.json,
      html: eventPromotion.html,
    },
  },
  {
    name: "Engage Active Customers",
    description:
      "Bring active followers back with a fresh event or offer update.",
    template: {
      content: "",
      designJson: engageActiveCustomers.json,
      html: engageActiveCustomers.html,
    },
  },
  {
    name: "Send Event Invitation",
    description:
      "Invite customers to a specific event and link them straight to tickets.",
    template: {
      content: "",
      designJson: eventInvitationWithFlyer.json,
      html: eventInvitationWithFlyer.html,
    },
  },
];
