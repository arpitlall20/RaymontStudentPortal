import { Badge } from "@/components/ui/badge";

const map: Record<string, { tone: "default" | "success" | "warning" | "danger" | "info" | "brand"; label?: string }> = {
  ACTIVE: { tone: "success" },
  APPLICANT: { tone: "info" },
  OFFERED: { tone: "brand" },
  ALUMNI: { tone: "default" },
  SUBMITTED: { tone: "info" },
  INTERVIEW: { tone: "warning" },
  ACCEPTED: { tone: "success" },
  DECLINED: { tone: "danger" },
  WITHDRAWN: { tone: "default" },
  OPEN: { tone: "warning" },
  IN_PROGRESS: { tone: "info" },
  RESOLVED: { tone: "success" },
  CLOSED: { tone: "default" },
};

export function StatusBadge({ value }: { value: string }) {
  const cfg = map[value] ?? { tone: "default" as const };
  return <Badge tone={cfg.tone}>{cfg.label ?? value.replaceAll("_", " ")}</Badge>;
}
