export type LegalSlug = "privacy" | "terms" | "cookies" | "entity";

export type LegalSection = {
  heading: string;
  body: string[];
  items?: string[];
};

export type LegalContent = {
  slug: LegalSlug;
  title: string;
  intro: string;
  lastReviewed: string;
  sections: LegalSection[];
};

// Pre-launch: single contact address for all customer-facing channels.
// tech@hoizr.com is reserved for engineering / security disclosures.
const SUPPORT_EMAIL = "contact@hoizr.com";
const PRIVACY_EMAIL = "contact@hoizr.com";
const LEGAL_EMAIL = "contact@hoizr.com";

const LEGAL_CONTENT: Record<LegalSlug, LegalContent> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    intro:
      "How Hoizr collects, uses, shares, stores, and protects information when organisers run events and fans buy, receive, or engage with event communications.",
    lastReviewed: "May 24, 2026",
    sections: [
      {
        heading: "Who this policy covers",
        body: [
          "This Privacy Policy applies to Hoizr Technologies Pvt. Ltd. and the Hoizr platform, including business.hoizr.com, hoizr.com, dashboards, checkout flows, event pages, door-scanning tools, campaign tools, APIs, support channels, and related services.",
          "In this policy, a Host or Organiser means a business, promoter, venue, festival, club, comedy room, artist team, or other person using Hoizr to create, promote, sell, scan, or settle an event. A Customer or Attendee means a person who browses, registers for, buys, receives, transfers, or uses a ticket, invite, guestlist entry, QR code, campaign message, or event-related communication. Hosts, Customers, collaborators, team members, and visitors are collectively called Users.",
        ],
      },
      {
        heading: "Hoizr as controller and processor",
        body: [
          "Hoizr acts as an independent data fiduciary or controller for information we collect to create accounts, operate the platform, secure the service, process our own commercial records, communicate with Users, run support, prevent abuse, and comply with legal, tax, accounting, and regulatory obligations.",
          "Hoizr acts as a processor or service provider when a Host uploads or imports their fan database, CRM contacts, guestlists, promoter lists, invite lists, or campaign audiences and asks Hoizr to process that data for the Host's event, campaign, door operation, reporting, or settlement workflow. In those cases, the Host decides why that data is used and must have the required consent, notice, or other lawful basis to upload and use it.",
        ],
      },
      {
        heading: "Information we collect from Users",
        body: [
          "We collect information you provide directly, information generated when you use Hoizr, information provided by Hosts or team members, and information from service providers that help us run payments, messages, analytics, fraud checks, hosting, support, and settlement.",
        ],
        items: [
          "Identity and contact data, such as name, email address, phone number, account role, OTP or login metadata, profile details, and support messages.",
          "Host business data, such as legal name, trade name, venue details, team members, permissions, bank account verification status, payout account details, PAN, GST registration type, GSTIN where provided, billing address, and tax declarations.",
          "Event and ticket data, such as event title, city, venue, date, ticket type, price, guestlist settings, invite QR, scanner activity, arrival status, refund status, cancellation status, chargeback status, and settlement records.",
          "Customer and fan data, such as ticket buyer name, phone, email, event attendance history, purchase source, campaign segment, communication preferences, imported contact fields, check-in status, and CRM notes configured by the Host.",
          "Campaign and marketing data, such as email, SMS, WhatsApp, push, in-app, or other message content, send logs, delivery events, open and click signals where available, unsubscribe state, wallet credit use, and campaign performance.",
          "Payment and finance metadata, such as Razorpay order IDs, payment IDs, refund IDs, invoice IDs, payout IDs, ledger entries, settlement statements, GST split metadata, and reconciliation records. Hoizr does not store full card numbers, UPI credentials, CVV, or other complete payment credentials.",
          "Technical data, such as IP address, device type, browser, operating system, cookies, session identifiers, crash logs, security logs, pages visited, referring URLs, approximate location inferred from network or device settings, and usage events.",
        ],
      },
      {
        heading: "How we use information",
        body: [
          "We use information to provide, secure, improve, and account for the Hoizr platform. We do not sell or trade a Host's customer database to unrelated organisers.",
        ],
        items: [
          "Create and manage Host, Customer, collaborator, scanner, and team-member accounts.",
          "Publish event pages, process ticket orders, issue confirmations, create QR codes, scan entries, manage refunds, handle cancellations, and support door operations.",
          "Send transactional messages such as login OTPs, ticket confirmations, refund updates, event changes, payout updates, account alerts, security notices, and legal notices.",
          "Run Host-directed campaigns through channels such as email, SMS, WhatsApp, push, in-app notifications, and similar channels, subject to preferences and opt-outs.",
          "Calculate platform fees, Hoizr commissions, GST, ticket GST pass-through, AI Boost charges, marketing credit top-ups, unused credit refunds, chargebacks, ledger entries, invoices, credit notes, and payout statements.",
          "Verify payout readiness, bank account status, Host declarations, KYC-dependent checks, admin verification, and fraud or risk signals.",
          "Respond to support requests, investigate bugs, analyse product usage, improve dashboards, personalize operational recommendations, and maintain reliable reporting.",
          "Comply with law, tax, accounting, audit, payment, security, regulatory, dispute, chargeback, and court or government requirements.",
        ],
      },
      {
        heading: "Marketing and owned customer data",
        body: [
          "Hosts use Hoizr to keep and activate their own customer relationships. If you buy a ticket from, join the guestlist of, follow, or otherwise interact with a Host through Hoizr, that Host may receive information needed to run the event and may use Hoizr to contact you about that Host's related events, offers, loyalty benefits, door updates, or post-event communication.",
          "You can unsubscribe from non-transactional email or message campaigns where an unsubscribe or opt-out mechanism is provided. Transactional, legal, safety, payment, refund, account, and event-critical messages may still be sent where needed to provide the service or comply with law.",
        ],
      },
      {
        heading: "Who we share information with",
        body: [
          "We share information only where needed to run Hoizr, honour a User request, support a Host's event workflow, meet legal duties, protect the platform, or complete a business transaction.",
        ],
        items: [
          "Hosts and their authorised team members, for events, tickets, customer lists, imported audiences, campaign results, scanner logs, refunds, and settlement records connected to that Host.",
          "Customers, where needed to show event details, ticket status, refund status, Host information, venue instructions, or campaign unsubscribe controls.",
          "Payment, payout, KYC, messaging, email, WhatsApp, SMS, push notification, cloud hosting, analytics, customer support, security, accounting, and infrastructure providers that process data for Hoizr or for a Host-directed workflow.",
          "Government, tax, law-enforcement, court, regulator, payment-network, bank, chargeback, audit, or professional-adviser recipients where disclosure is required or reasonably necessary.",
          "A successor, buyer, investor, affiliate, or restructuring participant if Hoizr is involved in a merger, financing, acquisition, sale, reorganisation, or transfer of all or part of the business, subject to appropriate confidentiality protections.",
        ],
      },
      {
        heading: "Payments, GST, payouts, and finance records",
        body: [
          "Hoizr's finance model creates records that may include personal data and commercial data. These records are used for checkout, customer booking fees, Hoizr commission, GST on Hoizr fees, ticket GST pass-through where the Host is eligible, refunds, chargebacks, marketing credits, AI Boost charges, invoices, credit notes, payout statements, and reconciliation.",
          "In V1, customer ticket payments route through Hoizr's payment flow and organiser payouts are created after the event, the refund window, and admin verification. Hoizr absorbs payment gateway and payout fees in V1 and does not deduct those processor fees from Host payouts unless the finance configuration or commercial terms change.",
        ],
      },
      {
        heading: "Cookies and tracking",
        body: [
          "Hoizr uses cookies, local storage, session identifiers, analytics events, and similar technologies to keep Users signed in, remember preferences, secure accounts, measure product usage, understand marketing performance, detect abuse, and improve the service. More detail appears in the Cookies & Trackers page.",
        ],
      },
      {
        heading: "Storage, transfers, and security",
        body: [
          "Information may be stored and processed in India and in other countries where Hoizr or its service providers operate infrastructure. By using Hoizr, you understand that your information may be transferred, stored, and processed outside your city, state, or country, subject to safeguards required by applicable law.",
          "We use technical and organisational controls intended to protect information, including access controls, role-based permissions, secure transport, provider security controls, audit trails, operational monitoring, and internal review processes. No internet service can guarantee absolute security, so Users must also protect their devices, passwords, OTPs, sessions, and account access.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "We keep information for as long as needed to provide Hoizr, maintain event history, support CRM exports, settle payouts, process refunds and chargebacks, issue invoices or credit notes, meet tax and accounting obligations, resolve disputes, enforce agreements, secure the platform, and comply with law.",
          "Host-imported customer data remains available to the Host while the Host account is active, unless deleted, exported, restricted, or otherwise handled according to the Host's instructions and Hoizr's legal obligations. Some records, including finance, tax, fraud, dispute, and security logs, may need to be retained even after an account or contact is deleted.",
        ],
      },
      {
        heading: "Your rights and choices",
        body: [
          "Depending on your location and how Hoizr holds the data, you may ask to access, correct, update, export, restrict, or delete personal information, withdraw consent where processing is based on consent, object to certain marketing, or raise a grievance.",
          "If your request relates to information controlled by a Host, such as a Host-imported CRM contact or campaign audience, we may route the request to that Host or work with the Host to respond. We may verify your identity before acting on a request and may retain information where law, tax, fraud-prevention, dispute, chargeback, accounting, or safety obligations require it.",
        ],
      },
      {
        heading: "Children and age-restricted events",
        body: [
          "Hoizr is not designed for children to create Host accounts. Events may have age, alcohol, venue, or entry restrictions set by the Host or venue. Customers must check the event page and venue rules before purchase and attendance.",
        ],
      },
      {
        heading: "Changes and contact",
        body: [
          `We may update this Privacy Policy as Hoizr, applicable law, or our operating model changes. Material updates will be posted on this page and, where required, communicated through the platform or email.`,
          `Privacy requests: ${PRIVACY_EMAIL}. General support: ${SUPPORT_EMAIL}. Legal notices: ${LEGAL_EMAIL}.`,
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    intro:
      "The terms that govern Hoizr accounts, event listings, ticket sales, door operations, marketing tools, refunds, finance flows, and organiser payouts.",
    lastReviewed: "May 24, 2026",
    sections: [
      {
        heading: "Acceptance of these terms",
        body: [
          "By creating an account, logging in, listing an event, buying or receiving a ticket, scanning at the door, sending a campaign, using an API, accepting a payout declaration, or otherwise using Hoizr, you agree to these Terms & Conditions.",
          "If you use Hoizr for an organisation, business, venue, promoter, artist, brand, or team, you confirm that you are authorised to bind that organisation. If you do not agree, you must not use Hoizr.",
        ],
      },
      {
        heading: "Definitions",
        body: [
          "Hoizr means Hoizr Technologies Pvt. Ltd. and the Hoizr platform. Service means Hoizr's websites, dashboards, event pages, ticketing, checkout, QR, scanner, guestlist, CRM, campaign, reporting, AI Event Assistant, settlement, payout, support, and related services.",
          "Host or Organiser means a User who creates, manages, promotes, sells, scans, settles, or reports on an event through Hoizr. Customer or Attendee means a User who browses, buys, registers for, receives, transfers, redeems, scans, or attends using a ticket, QR, invite, guestlist entry, campaign link, or related event record. Collaborator means a User invited by a Host, including a promoter, door staff member, scanner, team member, analyst, or admin.",
          "Ticket includes paid tickets, free guestlist entries, invite QRs, RSVP records, wristband or entry records, and any other event access credential issued through Hoizr. Platform Fee means the customer booking fee shown at checkout. Commission means Hoizr's Host-side event commission. Ticket GST means GST on the Host's ticket value when the Host is eligible and chooses to collect it. Hoizr Fee GST means GST charged on Hoizr's own fees.",
        ],
      },
      {
        heading: "What Hoizr provides",
        body: [
          "Hoizr is a technology, ticketing, marketing, entry, CRM, and settlement platform for live events. Hoizr is not the organiser, producer, venue, security agency, crowd manager, medical provider, alcohol vendor, transport provider, or safety authority for events listed by Hosts unless expressly stated in a separate written agreement.",
          "Hosts remain responsible for the event itself, including permissions, licensing, event content, venue readiness, crowd management, safety, emergency response, staffing, artist obligations, local-law compliance, taxes on their supplies, entry rules, customer experience, and refunds where applicable.",
        ],
      },
      {
        heading: "Accounts and access",
        body: [
          "You must provide accurate account, business, tax, bank, and contact information and keep it updated. You are responsible for protecting passwords, OTPs, devices, sessions, API keys, team-member access, scanner access, and any actions taken through your account.",
          "Hoizr may refuse registration, restrict access, suspend an account, hold a payout, reject an event, require additional verification, or remove content where we reasonably believe there is fraud, security risk, legal risk, tax risk, abuse, customer harm, chargeback exposure, inaccurate information, or breach of these terms.",
        ],
      },
      {
        heading: "Host responsibilities",
        body: [
          "Hosts must ensure every event listing is accurate and lawful before tickets or invites are issued. This includes event name, venue, city, date, entry times, age rules, refund policy, ticket prices, tax settings, lineup, door policy, safety rules, capacity, collaborator permissions, guestlist rules, and customer-facing claims.",
          "Hosts are responsible for obtaining and maintaining all registrations, licences, permissions, NOCs, performance rights, venue permissions, alcohol-related approvals, artist approvals, municipal permissions, tax registrations, and other approvals required for the event. Hosts must not use Hoizr for unlawful, misleading, unsafe, discriminatory, fraudulent, or prohibited activity.",
        ],
      },
      {
        heading: "Customer responsibilities",
        body: [
          "Customers must review the event page, Host terms, venue rules, refund policy, age restrictions, entry requirements, ID requirements, timing, and safety notices before purchase or attendance. A ticket gives the right to seek entry according to those rules; it does not guarantee entry where the Customer fails eligibility, safety, ID, behaviour, dress-code, timing, legal, or venue requirements.",
          "Customers must not duplicate, tamper with, resell unlawfully, misuse, or commercially exploit tickets, QR codes, guestlist entries, campaign links, or scanner flows. Attendees are responsible for their own conduct, including alcohol consumption and compliance with applicable law.",
        ],
      },
      {
        heading: "Ticket pricing, platform fees, and commission",
        body: [
          "Hoizr's finance source of truth currently configures free or guestlist events at 0% commission, exclusive paid events at 4.49% commission plus 18% GST, and non-exclusive paid events at 8.49% commission plus 18% GST. AI Event Assistant or AI Boost offers may replace the basic commission rate with a rate in the configured band and may include a separate AI Boost fee plus GST.",
          "The customer Platform Fee is currently 5% of ticket taxable value, with 18% GST on that platform fee. The Platform Fee is calculated on ticket taxable value, not on the ticket GST component. Hoizr's Host-side commission is also calculated on ticket taxable value, not on ticket GST.",
          "Commercial values are stored in Hoizr's configuration and may change for future events, future purchases, new products, special plans, or written commercial arrangements. Rates locked into an order or event snapshot are used for that order or event settlement unless correction is required for fraud, mistake, legal compliance, or a system error.",
        ],
      },
      {
        heading: "GST, tax, and Host declarations",
        body: [
          "Hoizr charges GST on Hoizr's own fees where applicable, including customer platform fees, Host commission, marketing credit purchases, and AI Boost fees. Ticket GST is separate: when a Host is eligible to collect ticket GST, Hoizr may collect it from Customers on the Host's behalf and pass it through to the Host; the Host remains responsible for tax treatment and remittance on the Host's ticket supply.",
          "Only Hosts with verified GST status marked as Regular or Casual Taxable Person may collect ticket GST through Hoizr. Unregistered and composition Hosts cannot separately collect ticket GST through Hoizr. If a Host saves payout details as unregistered or composition, Hoizr may require a Section 24(IX) CGST Act declaration acknowledging the Host's tax position, liability, and indemnity to Hoizr.",
          "Hosts are responsible for their own GST, PAN, TDS, TCS, income-tax, withholding, return filing, invoicing obligations, and professional advice. Hoizr may deduct, collect, withhold, report, or require records where law, configuration, payment-provider rules, or finance controls require it.",
        ],
      },
      {
        heading: "Payouts and settlement",
        body: [
          "For V1, Hoizr uses Normal Pay: Customer funds route through Hoizr's payment flow and eligible Host payouts are made from Hoizr's settlement account to the verified Host bank account. Direct Pay is disabled unless Hoizr enables it under a separate arrangement.",
          "The system auto-calculates settlement after the event and refund window, then creates a pending payout summary. Funds are not auto-released: an authorised Hoizr admin must review and verify the payout before Razorpay X or another payout provider is instructed to send money.",
          "The current finance source of truth makes payouts eligible after a two-working-day refund window inside the event payout cycle. Exclusive events are currently expected within 5-7 working days after event end and non-exclusive events within 8-10 working days after event end, subject to verification, bank/KYC readiness, refunds, chargebacks, disputes, reconciliation, risk checks, holidays, payment-provider delays, and account holds.",
          "Hoizr may deduct or adjust commission, GST on commission, approved refunds, chargebacks, AI Boost amounts, unpaid Hoizr dues, cancellation charges where applicable, tax withholdings where enabled, and other amounts payable under these terms or a written agreement. In V1, Hoizr absorbs payment gateway and payout fees and does not deduct those processor fees from Host payout.",
        ],
      },
      {
        heading: "Refunds, cancellations, and chargebacks",
        body: [
          "Each event may have a refund policy, including non-refundable, refundable until sales end, refundable until event start, or organiser-approval-required. Customers must check the event policy before purchase. If organiser approval is required, Hoizr may forward or surface the request to the Host and process the refund after approval.",
          "By default, the customer Platform Fee and GST on that Platform Fee are non-refundable. Ticket GST, where collected on the ticket value and where refundable under the applicable policy, is refunded with the ticket amount. Chargebacks, failed payments, disputes, suspicious activity, and payment-provider reversals may reduce a Host payout or be recovered from future payouts.",
          "If an event is cancelled, Hoizr may stop sales, cancel valid tickets, process refunds according to policy and law, hold settlement, deduct permitted cancellation costs or unrecovered amounts from Host payouts, and require the Host to communicate with Customers. Hosts must not move a paid event exclusively to another platform after Hoizr tickets have been sold without addressing existing customer, payout, fee, and brand-impact obligations.",
        ],
      },
      {
        heading: "Offline tickets and direct payments",
        body: [
          "If a Customer pays a Host, promoter, venue, or third party outside Hoizr, that payment relationship is between the Customer and that recipient. Hoizr is not responsible for cash, UPI, card, bank-transfer, or other offline payments collected outside Hoizr, and Hoizr is not required to refund offline payments unless expressly agreed in writing.",
          "Hosts using Hoizr tools for offline ticket issuance, door validation, or operational tracking remain responsible for offline payment collection, receipts, disputes, refunds, tax treatment, and customer communication.",
        ],
      },
      {
        heading: "Marketing credits and campaigns",
        body: [
          "Hosts may use Hoizr marketing tools to send or schedule campaigns through configured channels such as email, SMS, WhatsApp, push, in-app, or similar channels. Hosts must have the required consent, notice, opt-in, or other lawful basis for imported contacts and must honour unsubscribe, opt-out, and messaging rules.",
          "Marketing credits are currently configured as 1 credit = INR 1, minimum 100 credits per top-up, no platform fee on credit purchase, and 18% GST on the credit value. Used credits are non-refundable. Unused credits are refundable at INR 1 per unused credit plus the corresponding GST reversal, subject to Hoizr's records, payment-provider constraints, and compliance checks.",
          "Default channel debit rates are configuration-driven. Current defaults are email 1 credit, SMS 0.2 credit, WhatsApp 0.5 credit, and push notification 0 credit per send. Hoizr may update channel availability, provider routes, approval requirements, templates, pricing, and deliverability controls for future campaigns.",
        ],
      },
      {
        heading: "Collaborators, promoters, and scanner teams",
        body: [
          "Hosts may invite collaborators, promoters, scanner staff, analysts, or team members. The Host is responsible for the permissions granted, actions taken, commissions promised, lists shared, and errors made by those users unless Hoizr is directly responsible under a separate written agreement.",
          "Hoizr is not the employer, agent, payroll provider, or tax advisor for Host collaborators, promoters, reps, scanner staff, or venue teams. Any commission, fee, employment, tax, or operational arrangement between the Host and those users is the Host's responsibility.",
        ],
      },
      {
        heading: "Content, intellectual property, and feedback",
        body: [
          "Hoizr owns or licenses the platform, software, designs, dashboards, code, trademarks, logos, documentation, templates, analytics structure, and related intellectual property. Users must not copy, reverse engineer, scrape, resell, sublicense, modify, interfere with, or commercially exploit Hoizr except as allowed by these terms.",
          "Hosts retain responsibility for event content, images, names, descriptions, lineups, logos, offers, and campaign materials they upload or approve. Hosts grant Hoizr the rights needed to host, display, resize, distribute, send, index, analyse, and promote that content for the event and related platform operation. Feedback may be used by Hoizr without restriction or compensation.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Users must not use Hoizr to commit fraud, mislead customers, sell illegal or unsafe events, violate intellectual-property rights, spam, harass, discriminate, bypass payment flows, manipulate scans, tamper with tickets, reverse engineer the platform, introduce malware, overload systems, scrape data, evade fees, hide taxes, or violate applicable law.",
          "Hoizr may remove events, block campaigns, disable scanners, restrict exports, suspend accounts, hold payouts, cancel tickets, or notify authorities where we reasonably believe there is a legal, safety, payment, fraud, customer-protection, tax, security, or platform-integrity risk.",
        ],
      },
      {
        heading: "Event risk, safety, and substances",
        body: [
          "Events can involve risks, including crowding, weather, venue conditions, transport issues, artist changes, medical incidents, alcohol consumption, substance misuse, security events, government orders, and emergencies. Hosts and venues are responsible for safety arrangements, lawful entry control, emergency response, medical support, crowd management, and regulatory compliance.",
          "Hoizr does not permit, endorse, organise, sell, or facilitate illegal substances. Customers and Hosts are solely responsible for their own conduct and compliance with law. Hoizr is not liable for injury, illness, death, loss, or damage arising from an event except to the extent liability cannot be excluded under applicable law.",
        ],
      },
      {
        heading: "Data protection",
        body: [
          "Hoizr's Privacy Policy explains how personal information is collected, used, shared, retained, and protected. Hosts uploading or importing customer databases, guestlists, contacts, or campaign audiences must have the required rights and must indemnify Hoizr for claims arising from unlawful or unauthorised uploads, messaging, processing, or exports.",
          "Where Hoizr processes personal data for a Host, the Host remains responsible for the instructions, lawful basis, notices, consents, opt-outs, accuracy, retention, and customer requests for that data unless applicable law places an independent obligation on Hoizr.",
        ],
      },
      {
        heading: "Service availability and changes",
        body: [
          "Hoizr aims to provide a reliable service but does not guarantee uninterrupted, error-free, or always-available access. Maintenance, outages, provider failures, telecom issues, security incidents, payment-provider downtime, force majeure, or product changes may affect the service.",
          "Hoizr may add, remove, suspend, limit, redesign, or change features, integrations, pricing configurations, campaign channels, payout workflows, support channels, or eligibility rules. Material changes to these terms will be posted on the site or communicated through the service where required.",
        ],
      },
      {
        heading: "Warranty disclaimer and liability limit",
        body: [
          "The service is provided on an as-is and as-available basis to the fullest extent permitted by law. Hoizr does not warrant that event outcomes, sales, attendance, delivery rates, revenue, rankings, settlement timing, or campaign performance will meet expectations.",
          "To the fullest extent permitted by law, Hoizr is not liable for indirect, consequential, special, punitive, exemplary, loss-of-profit, loss-of-data, loss-of-goodwill, business-interruption, event-loss, or third-party damages. Hoizr's total liability for claims connected to the service is limited to the amount paid to Hoizr as Hoizr fees by the claiming User in the twelve months before the claim, except where law does not allow that limitation.",
        ],
      },
      {
        heading: "Indemnity",
        body: [
          "Users agree to defend, indemnify, and hold Hoizr, its officers, employees, contractors, affiliates, payment partners, and service providers harmless from claims, losses, liabilities, penalties, damages, costs, and expenses arising from their event, content, customers, imported data, taxes, licences, refunds, safety failures, collaborator actions, offline payments, breach of these terms, or violation of law.",
        ],
      },
      {
        heading: "Termination",
        body: [
          "You may stop using Hoizr at any time, subject to payment, refund, payout, tax, dispute, chargeback, customer-service, and data-retention obligations that survive termination. Hoizr may suspend or terminate access immediately where required for safety, security, legal, tax, payment, abuse, fraud, or breach reasons.",
          "After termination, licences granted to use the service end, but provisions on payments, taxes, refunds, chargebacks, data, intellectual property, acceptable use, disclaimers, liability, indemnity, governing law, and dispute resolution continue as needed.",
        ],
      },
      {
        heading: "Governing law and notices",
        body: [
          "These terms are governed by Indian law. Courts in the city of Hoizr's registered office will have exclusive jurisdiction unless applicable law requires another forum.",
          `Notices and legal requests may be sent to ${LEGAL_EMAIL}. Support requests may be sent to ${SUPPORT_EMAIL}. Hoizr may send notices through the dashboard, event admin area, email, SMS, WhatsApp, push notification, or by posting to the site where permitted by law.`,
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    title: "Cookies & Trackers",
    intro:
      "What cookies and similar technologies Hoizr uses on the marketing site, host dashboard, checkout, and event workflows.",
    lastReviewed: "May 24, 2026",
    sections: [
      {
        heading: "Essential technologies",
        body: [
          "Hoizr uses essential cookies, local storage, session identifiers, CSRF/security signals, and device/session metadata to keep Users signed in, protect accounts, route requests, remember selected hosts, manage checkout sessions, and prevent abuse.",
        ],
      },
      {
        heading: "Analytics and product improvement",
        body: [
          "We may use analytics events to understand which pages, dashboards, checkout steps, campaign screens, scanner flows, and reports are working or failing. These signals help diagnose bugs, improve performance, and prioritise product decisions.",
        ],
      },
      {
        heading: "Marketing and attribution",
        body: [
          "Hoizr may use marketing pixels, referral parameters, campaign identifiers, and attribution tools on public pages to understand which campaigns or channels brought a visitor to Hoizr. Hosts may also use campaign links and tags to understand event demand.",
        ],
      },
      {
        heading: "Your controls",
        body: [
          "You can control cookies through your browser or device settings. Blocking essential cookies may break login, checkout, dashboard, QR, scanner, and security functions. Campaign unsubscribe controls are separate from browser cookie settings.",
        ],
      },
    ],
  },
  entity: {
    slug: "entity",
    title: "Entity, GST & Registered Office",
    intro:
      "Hoizr's operating entity details, support contacts, and launch-readiness notes for statutory identifiers.",
    lastReviewed: "May 24, 2026",
    sections: [
      {
        heading: "Registered entity",
        body: [
          "Hoizr Technologies Pvt. Ltd. is the operating entity name used across Hoizr's public site and product. Final CIN, registered office, director, and statutory details will be published here when incorporation records and invoice configuration are finalised.",
        ],
      },
      {
        heading: "GST identifier",
        body: [
          "Hoizr's finance source of truth marks GSTIN as pending before live GST invoicing. Hoizr's configured GST state code is Maharashtra, code 27, for Hoizr-issued invoice split logic. The final GSTIN must be published and configured before live GST invoices are issued.",
        ],
      },
      {
        heading: "Finance and tax configuration",
        body: [
          "Hoizr's V1 finance configuration uses Normal Pay only, Hoizr-absorbed payment gateway and payout fees, 5% customer platform fee on event ticket taxable value, 18% GST on Hoizr fees, 0% platform fee on marketing credit purchases, and a two-working-day post-event refund window before payout eligibility.",
        ],
      },
      {
        heading: "Grievance and support contacts",
        body: [
          `Support: ${SUPPORT_EMAIL}. Privacy: ${PRIVACY_EMAIL}. Legal notices: ${LEGAL_EMAIL}. Grievance officer name, registered office address, CIN, GSTIN, and response timelines will be added here before public launch if required by applicable law.`,
        ],
      },
    ],
  },
};

export const getLegalContent = (slug: string): LegalContent | null => {
  if (!(slug in LEGAL_CONTENT)) return null;
  return LEGAL_CONTENT[slug as LegalSlug];
};

export const ALL_LEGAL_SLUGS: LegalSlug[] = [
  "privacy",
  "terms",
  "cookies",
  "entity",
];
