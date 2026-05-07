export const STAGE_LABELS: Record<string, string> = {
  group: "Fase de grupos",
  round32: "32avos",
  round16: "8vos",
  quarter: "4tos",
  semi: "Semifinal",
  third: "3er lugar",
  final: "Final",
};

export const STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  locked: "Bloqueado",
  finished: "Finalizado",
};

export const KNOCKOUT_STAGES = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
] as const;

export type KnockoutStage = (typeof KNOCKOUT_STAGES)[number];

export function isKnockoutStage(stage: string): stage is KnockoutStage {
  return (KNOCKOUT_STAGES as readonly string[]).includes(stage);
}
