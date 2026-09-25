import { useEffect, useState } from "react";
import { Activity, Building2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { getOperationalFeed } from "../services/api";

const ROLE_LABELS = { hospital:"Hospital", police:"Police", transport:"Transport", ngo:"NGO / Relief", citizen:"Citizen" };

export default function OperationalFeed({ accessToken }) {
  const [updates,setUpdates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const load=async()=>{
    try{setLoading(true);setError("");const result=await getOperationalFeed(accessToken);setUpdates(result.updates||[]);}
    catch(err){setError(err.message||"Unable to load operational updates.");}
    finally{setLoading(false);}
  };

  useEffect(()=>{load();const timer=setInterval(load,5000);return()=>clearInterval(timer);},[accessToken]);

  return <section className="overflow-hidden rounded-xl border border-border bg-surface animate-rise">
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-safe/10 text-safe"><Activity size={17}/></span>
        <div><div className="flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-text-tertiary">Live agency network</p><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-safe"/></div><h2 className="mt-1 text-[15px] font-semibold text-text-primary">Operational Updates</h2><p className="mt-1 text-[12px] text-text-secondary">Authenticated field updates shared with the coordination center.</p></div>
      </div>
      <button onClick={load} disabled={loading} className="flex items-center gap-2 self-start rounded-lg border border-border px-3 py-2 text-[11px] font-semibold text-text-secondary hover:border-coordinator/30 hover:text-text-primary disabled:opacity-50"><RefreshCw size={13} className={loading?"animate-spin":""}/> Refresh</button>
    </div>
    {error?<div className="px-5 py-5 text-[12px] text-critical">{error}</div>:updates.length===0?<div className="px-5 py-8 text-center text-[12px] text-text-tertiary">Waiting for agency updates…</div>:<div className="divide-y divide-border">{updates.slice(0,8).map((item,index)=><div key={String(item.updated_at)+"-"+index} className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-coordinator"><Building2 size={15}/></div>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-[12px] font-semibold text-text-primary">{item.organization}</p><span className="rounded-full border border-border px-2 py-0.5 text-[9px] uppercase tracking-wider text-text-tertiary">{ROLE_LABELS[item.role]||item.role}</span></div><p className="mt-1 text-[12px] text-text-secondary"><span className="font-semibold text-text-primary">{item.metric}:</span> {item.value}{item.note ? " · "+item.note : ""}</p></div>
      <div className="flex items-center gap-1 text-[10px] text-text-tertiary"><Clock3 size={12}/> Live feed</div>
    </div>)}</div>}
    <div className="flex items-center gap-2 border-t border-border bg-surface-2/30 px-5 py-3 text-[10px] text-text-tertiary"><ShieldCheck size={13} className="text-safe"/> Updates are authenticated and visible to authorized government coordinators.</div>
  </section>;
}
