import { QualifiersLoader } from "./qualifiers-loader";

export default function QualifiersPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">
        Clasificados
      </h1>
      <QualifiersLoader />
    </div>
  );
}
