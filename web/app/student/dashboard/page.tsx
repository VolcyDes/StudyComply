export default function StudentDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
        Student space
      </div>
      <h1 className="text-3xl font-bold">Student dashboard</h1>
      <p className="mt-2 text-slate-600">Clean baseline. Rebuilding UI next.</p>
    </main>
  );
}

/**
 * Guard (append-only): if someone opens /student/dashboard but is UNIVERSITY, redirect.
 * NOTE: If you later refactor, move this into the component body properly.
 */
