import { StatsCharts } from "./stats-charts";

export default function StatsPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-zinc-900">
        Estadísticas de participantes
      </h2>
      <StatsCharts />
    </div>
  );
}
