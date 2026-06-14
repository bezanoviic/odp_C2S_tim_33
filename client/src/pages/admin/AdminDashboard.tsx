import { useNavigate } from "react-router-dom";
import { PageHeader, StatCard } from "../../components/ui/UI";

const sections = [
  {
    label: "Games",
    value: "Catalog",
    sub: "Add titles, genres and team sizes",
    path: "/admin/games",
  },
  {
    label: "Users",
    value: "Access",
    sub: "Review accounts and change roles",
    path: "/admin/users",
  },
  {
    label: "Tournaments",
    value: "Create",
    sub: "Configure dates, brackets and prizes",
    path: "/admin/tournaments/new",
  },
  {
    label: "Registrations",
    value: "Queue",
    sub: "Confirm, reject or disqualify teams",
    path: "/admin/registrations",
  },
  {
    label: "Health",
    value: "Nodes",
    sub: "Watch API and database availability",
    path: "/admin/health",
  },
  {
    label: "Audit",
    value: "Logs",
    sub: "Track important platform events",
    path: "/admin/audit",
  },
];

const quickStats = [
  { label: "Control mode", value: "Admin", sub: "Role-based access enabled" },
  { label: "Stack", value: "C2S", sub: "React · Express · MySQL" },
  { label: "Status", value: "Live", sub: "Use health tab for node details", color: "text-cyan-100" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader eyebrow="Admin control" title="Command overview" />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {quickStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="pg-card overflow-hidden">
        <div className="border-b border-cyan-200/10 bg-cyan-200/[0.025] px-5 py-4">
          <p className="m-0 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/50">Admin modules</p>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, index) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="group rounded-[24px] border border-cyan-200/12 bg-[#06111f]/58 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-200/[0.045]"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <span className="rounded-full border border-cyan-200/15 bg-cyan-200/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/55">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_18px_rgba(78,231,255,0.65)] transition group-hover:bg-white" />
              </div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/42">{section.label}</p>
              <h2 className="m-0 text-2xl font-black tracking-tight text-white">{section.value}</h2>
              <p className="mt-3 min-h-10 text-sm leading-6 text-white/42">{section.sub}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-[26px] border border-cyan-200/12 bg-cyan-200/[0.035] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/50">Session</p>
            <p className="mt-2 text-sm text-white/48">Admin tools now use the same blue control-panel style as the rest of the project.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-lime-100/80">
            <span className="h-2 w-2 rounded-full bg-lime-200 shadow-[0_0_18px_rgba(185,255,102,0.65)]" />
            admin online
          </span>
        </div>
      </div>
    </div>
  );
}
