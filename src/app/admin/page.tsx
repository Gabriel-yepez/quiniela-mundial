import { AdminMatchesLoader } from "./admin-matches-loader";

export default function AdminPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">
        Administrar partidos
      </h1>
      <AdminMatchesLoader />
    </div>
  );
}
