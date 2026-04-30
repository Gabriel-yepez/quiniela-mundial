import { StatsCharts } from "./stats-charts";

export default function StatsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] text-white">
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-white">
        Estadísticas de participantes
      </h2>
      <StatsCharts />
    </div>
  );
}
