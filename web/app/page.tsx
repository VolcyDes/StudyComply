import Link from "next/link";

function Card({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            MVP • Documents + deadlines + PDF attachments
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            A simple dashboard for deadlines you can’t afford to miss.
          </h1>

          <p className="mt-3 text-slate-600 leading-7">
            Store key documents (visa, insurance, contracts…), track expiry dates, and attach PDFs.
            Everything stays clear, structured, and easy to update.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Open dashboard
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Login / Create account
            </Link>

            <span className="text-xs text-slate-500">
              Secure by design • Your data stays private
            </span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Suggested first docs</p>
              <p className="mt-1 text-xs text-slate-600">Visa / Permit</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Keep proofs</p>
              <p className="mt-1 text-xs text-slate-600">Attach PDFs for renewals</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Stay ahead</p>
              <p className="mt-1 text-xs text-slate-600">Sort by urgency</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
            <p className="mt-1 text-sm text-slate-600">
              Minimal steps. No clutter.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Go to dashboard →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card
            title="1) Create a document"
            desc="Add title, type, and expiry date. Simple and fast."
          />
          <Card
            title="2) Attach a PDF (optional)"
            desc="Upload now or later. Replace or remove anytime."
          />
          <Card
            title="3) Track deadlines"
            desc="See what’s urgent and keep your documents organized."
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card
          title="Clear status"
          desc="Expired / soon / safe — visible directly on the dashboard."
        />
        <Card
          title="PDF management"
          desc="Upload, download, replace, or remove a PDF per document."
        />
        <Card
          title="Built for trust"
          desc="A clean, professional UI focused on clarity and reliability."
        />
      </section>

      {/* NEXT */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-semibold text-slate-900">Next steps</h2>
        <p className="mt-2 text-sm text-slate-600">
          Once the MVP is stable, we can add reminders and a calendar view.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Email reminders</p>
            <p className="mt-1 text-sm text-slate-600">7 / 30 days before expiry.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Calendar view</p>
            <p className="mt-1 text-sm text-slate-600">One place to see deadlines.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Mobile later</p>
            <p className="mt-1 text-sm text-slate-600">After the web is solid.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
