import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, ChevronRight, Eye, EyeOff, LockKeyhole, Mail, ShieldAlert, UserRound } from "lucide-react";
import { login, signup } from "../services/auth";

const ROLES = [
  { id: "government", label: "Government / Disaster Management", icon: "🏛️", desc: "Coordinate the complete emergency response." },
  { id: "hospital", label: "Hospital / Medical", icon: "🏥", desc: "Manage capacity, patients and medical resources." },
  { id: "police", label: "Police / Law Enforcement", icon: "👮", desc: "Manage routes, evacuation and public safety." },
  { id: "transport", label: "Emergency Transport", icon: "🚑", desc: "Track vehicles, routes and dispatch capacity." },
  { id: "ngo", label: "NGO / Relief Organization", icon: "🤝", desc: "Coordinate volunteers, supplies and shelters." },
  { id: "citizen", label: "Citizen / Public", icon: "🧑‍🤝‍🧑", desc: "View verified alerts, safe routes and support points." },
];

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"government", organization:"" });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (mode === "signup" && form.password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    setLoading(true);
    try {
      const result = mode === "login" ? await login({ email:form.email, password:form.password }) : await signup(form);
      onAuthenticated(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,.18),transparent_34%),radial-gradient(circle_at_85%_90%,rgba(20,184,166,.10),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden flex-col justify-between p-10 lg:flex xl:p-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300"><ShieldAlert size={22}/></div>
              <div><p className="text-sm font-semibold">Emergency AI Coordinator</p><p className="text-xs text-slate-500">Multi-agent emergency command platform</p></div>
            </div>
            <div className="mt-28 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>Response network online</div>
              <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-.04em] xl:text-6xl">One emergency.<br/><span className="text-indigo-300">One coordinated response.</span></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">Connect hospitals, police, transport, relief organizations and government teams through one shared operational picture.</p>
            </div>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {[["06","response roles"],["05","specialized agents"],["01","coordination layer"]].map(([value,label])=><div key={label} className="rounded-2xl border border-white/8 bg-white/[.025] p-4"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{label}</p></div>)}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[620px]">
            <div className="mb-7 flex items-center gap-3 lg:hidden"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300"><ShieldAlert size={20}/></div><div><p className="text-sm font-semibold">Emergency AI Coordinator</p><p className="text-[11px] text-slate-500">Secure response network</p></div></div>
            <div className="rounded-[28px] border border-white/10 bg-[#0d1016]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div className="mb-7 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-300">{mode==="login"?"Secure access":"Create responder profile"}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{mode==="login"?"Welcome back":"Join the response network"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode==="login"?"Sign in to access the operational workspace assigned to your role.":"Choose your operational role so the platform can show the right controls and information."}</p></div><LockKeyhole className="text-slate-600" size={20}/></div>

              <form onSubmit={submit} className="space-y-5">
                {mode==="signup" && <div className="grid gap-4 sm:grid-cols-2"><Field icon={UserRound} label="Full name"><input value={form.name} onChange={e=>update("name",e.target.value)} required placeholder="Your name" className="input"/></Field><Field icon={Building2} label="Organization"><input value={form.organization} onChange={e=>update("organization",e.target.value)} placeholder="Optional" className="input"/></Field></div>}
                <Field icon={Mail} label="Email address"><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} required placeholder="name@organization.org" className="input"/></Field>
                <Field icon={LockKeyhole} label="Password"><div className="relative"><input type={showPassword?"text":"password"} value={form.password} onChange={e=>update("password",e.target.value)} required placeholder="••••••••" className="input pr-11"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></Field>
                {mode==="signup" && <div><label className="mb-2 block text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500">Operational role</label><div className="grid gap-2 sm:grid-cols-2">{ROLES.map(role=><button key={role.id} type="button" onClick={()=>update("role",role.id)} className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition ${form.role===role.id?"border-indigo-400/40 bg-indigo-400/10":"border-white/8 bg-white/[.02] hover:border-white/15"}`}><span className="text-xl">{role.icon}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold">{role.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{role.desc}</span></span>{form.role===role.id&&<CheckCircle2 className="ml-auto shrink-0 text-indigo-300" size={16}/>}</button>)}</div></div>}
                {error&&<div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</div>}
                <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{loading?"Authenticating…":mode==="login"?"Enter secure workspace":"Create responder account"}{!loading&&<ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5"/>}</button>
              </form>

              <div className="mt-7 flex items-center justify-between border-t border-white/8 pt-5 text-xs"><span className="text-slate-500">{mode==="login"?"New to the response network?":"Already registered?"}</span><button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}} className="font-semibold text-indigo-300 hover:text-indigo-200">{mode==="login"?"Create account":"Sign in"}<ChevronRight className="ml-1 inline" size={13}/></button></div>
            </div>
            <p className="mt-5 text-center text-[10px] uppercase tracking-[.16em] text-slate-600">Hackathon prototype • role-based emergency coordination</p>
          </div>
        </section>
      </div>
      <style>{`.input{width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);padding:.78rem .9rem;font-size:.85rem;color:#fff;outline:none;transition:.2s}.input::placeholder{color:#475569}.input:focus{border-color:rgba(129,140,248,.5);box-shadow:0 0 0 3px rgba(99,102,241,.08)}`}</style>
    </div>
  );
}
function Field({icon:Icon,label,children}){return <div><label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500"><Icon size={13}/>{label}</label>{children}</div>}
