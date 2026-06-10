import { type ReactNode } from "react";

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin inline-block text-cyan-200/70">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="36 64" />
    </svg>
  );
}

export function Empty({ message = "No data" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-200/14 bg-cyan-200/5">
        <span className="absolute h-9 w-9 rounded-2xl border border-violet-200/14" />
        <span className="text-lg text-cyan-100/40">◇</span>
      </div>
      <p className="max-w-sm text-sm text-white/40">{message}</p>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {message}
    </div>
  );
}

export function SuccessBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 px-4 py-3 text-sm text-lime-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {message}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: "bg-cyan-300/10 text-cyan-100 border-cyan-200/20",
    ongoing: "bg-violet-300/10 text-violet-100 border-violet-200/20",
    completed: "bg-lime-300/10 text-lime-100 border-lime-200/20",
    cancelled: "bg-red-400/10 text-red-100 border-red-300/20",
    pending: "bg-amber-300/10 text-amber-100 border-amber-200/20",
    confirmed: "bg-lime-300/10 text-lime-100 border-lime-200/20",
    disqualified: "bg-red-400/10 text-red-100 border-red-300/20",
    scheduled: "bg-cyan-300/10 text-cyan-100 border-cyan-200/20",
    in_progress: "bg-violet-300/10 text-violet-100 border-violet-200/20",
    accepted: "bg-lime-300/10 text-lime-100 border-lime-200/20",
    rejected: "bg-red-400/10 text-red-100 border-red-300/20",
  };
  const dotStyles: Record<string, string> = {
    upcoming: "bg-cyan-200",
    ongoing: "bg-violet-200 animate-pulse",
    completed: "bg-lime-200",
    cancelled: "bg-red-300",
    pending: "bg-amber-200",
    confirmed: "bg-lime-200",
    disqualified: "bg-red-300",
    scheduled: "bg-cyan-200",
    in_progress: "bg-violet-200 animate-pulse",
    accepted: "bg-lime-200",
    rejected: "bg-red-300",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${styles[status] ?? "bg-white/5 text-white/45 border-white/10"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] ?? "bg-white/35"}`} />
      {label}
    </span>
  );
}

export function NodeBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy:  "bg-lime-300/10 text-lime-100 border-lime-200/20",
    degraded: "bg-amber-300/10 text-amber-100 border-amber-200/20",
    offline:  "bg-red-400/10 text-red-100 border-red-300/20",
    unreachable: "bg-red-400/10 text-red-100 border-red-300/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${styles[status] ?? "bg-white/5 text-white/45 border-white/10"}`}>
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${
      role === "admin" ? "bg-amber-300/10 text-amber-100 border-amber-200/20" : "bg-cyan-300/10 text-cyan-100 border-cyan-200/20"
    }`}>{role}</span>
  );
}

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center gap-3 text-xs text-white/42">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="rounded-xl border border-cyan-200/12 px-3 py-2 transition hover:border-cyan-200/30 disabled:opacity-30">←</button>
      <span className="font-mono text-cyan-100/70">{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
        className="rounded-xl border border-cyan-200/12 px-3 py-2 transition hover:border-cyan-200/30 disabled:opacity-30">→</button>
      <span className="text-white/28">{total} total</span>
    </div>
  );
}

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="pg-card p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/30">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/45">{label}</p>
      <p className={`text-3xl font-black tracking-tight ${color ?? "text-white"}`}>{value}</p>
      {sub && <p className="mt-2 text-xs text-white/34">{sub}</p>}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-200/12 bg-[#06111f]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-cyan-200/10 bg-cyan-200/[0.025]">
        {columns.map((c) => (
          <th key={c} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/42">{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-cyan-200/45" />
          <p className="m-0 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/52">{eyebrow}</p>
        </div>
        <h1 className="m-0 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
