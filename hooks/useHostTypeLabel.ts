import { HostType } from "@/generated/graphql";
import HostOnboardingStore from "@/store/hostOnboarding";
import useHostsStore from "@/store/host";

export type HostTypeLabel = {
  noun: string;
  possessive: string;
  role: string;
  plural: string;
  lower: string;
  unresolved: boolean;
};

const VENUE_LABEL: HostTypeLabel = {
  noun: "Venue",
  possessive: "Venue's",
  role: "Venue owner",
  plural: "Venues",
  lower: "venue",
  unresolved: false,
};

const ORGANIZER_LABEL: HostTypeLabel = {
  noun: "Organizer",
  possessive: "Organizer's",
  role: "Event organizer",
  plural: "Organizers",
  lower: "organizer",
  unresolved: false,
};

const UNRESOLVED_LABEL: HostTypeLabel = {
  ...VENUE_LABEL,
  unresolved: true,
};

const labelFor = (raw: string | null | undefined): HostTypeLabel => {
  if (!raw) return UNRESOLVED_LABEL;
  const v = String(raw).toUpperCase();
  if (v === HostType.Venue) return VENUE_LABEL;
  if (v === HostType.EventOrg || v === "EVENT_ORGANIZER" || v === "ORGANIZER") {
    return ORGANIZER_LABEL;
  }
  return UNRESOLVED_LABEL;
};

export function useHostTypeLabel(): HostTypeLabel {
  const selectedHostType = useHostsStore((state) => state.selectedHostType);
  const onboardingType = HostOnboardingStore((state) => state.hostType);
  return labelFor(selectedHostType ?? onboardingType);
}

export default useHostTypeLabel;
