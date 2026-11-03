"use client";

import { useEffect, useState } from "react";
import { Arrow, Brand } from "./icons";
import { Dialog, useContact } from "./site-shell";

const screens = [
  { title: "Operations overview", tag: "Biscon", items: [["Inventory", "Stock & suppliers", "Connected"], ["Sales", "Orders & point of sale", "Connected"], ["People", "HR & accounting", "Connected"]] },
  { title: "Your next conversation", tag: "OrbitLead", items: [["Discover", "Find relevant prospects", "Ready"], ["Personalise", "Prepare your outreach", "Ready"], ["Follow up", "Keep the conversation moving", "Ready"]] },
  { title: "One view of your portfolio", tag: "Domora", items: [["Properties", "Sites & units", "Connected"], ["Agreements", "Sales & leases", "Connected"], ["Insights", "Revenue & performance", "Connected"]] },
];

export function ProductConsole({ interactive = false }: { interactive?: boolean }) {
  const [screen,setScreen]=useState(0);
  useEffect(()=>{if (!interactive || matchMedia("(prefers-reduced-motion: reduce)").matches) return;const timer=setInterval(()=>setScreen(s=>(s+1)%3),6500);return()=>clearInterval(timer);},[interactive]);
  const data=screens[screen];
  return <div className="product-console"><aside className="console-sidebar"><Brand/><span className="console-workspace"><i/>Your workspace</span>{screens.map((s,i)=><button key={s.tag} className={screen===i?"active":""} onClick={()=>setScreen(i)} tabIndex={interactive?0:-1}><span className="console-menu-icon">{["◈","↗","▦"][i]}</span>{s.tag}</button>)}<span className="console-sidebar-bottom">Illustrative product overview</span></aside><div className="console-main"><div className="console-topbar"><span>Workspace <span>/</span> {data.tag}</span><span className="console-avatar">M</span></div><div className="console-content"><span className="eyebrow">{data.tag} / OVERVIEW</span><div className="console-heading"><h3>{data.title}</h3><span className="console-live"><i/>All systems connected</span></div><div className="console-stats">{[["Your operations","One connected view"],["Your workflows","Built around you"],["Your data","Always in context"]].map(([label,value],i)=><div key={label}><span>{label}</span><strong>{["01","02","03"][i]}</strong><small>{value}</small><svg viewBox="0 0 130 35" fill="none"><path d={`M0 ${30-i*2}L15 24 27 26 40 17 55 22 68 14 80 16 95 7 108 12 130 2`} stroke={i===1?"#8da9a3":"#a392f3"} strokeWidth="1.5"/></svg></div>)}</div><div className="console-panels"><div className="console-workflows"><span className="eyebrow">CONNECTED WORKFLOWS</span>{data.items.map(([title,description,status])=><div className="console-workflow" key={title}><span className="console-workflow-icon">◈</span><div><strong>{title}</strong><small>{description}</small></div><span className="status-tag">{status}</span><Arrow/></div>)}</div><div className="console-activity"><span className="eyebrow">RECENT ACTIVITY</span>{["Workspace connected","Workflow configured","Ready for your team"].map((text,i)=><div key={text}><i/><span>{text}<small>{i===0?"Just now":`${i*2} minutes ago`}</small></span></div>)}</div></div><div className="console-note"><i/>Software that fits the way your business works.<span>LIVE PREVIEW</span></div></div></div></div>;
}

export function DemoSection() {
  const [open,setOpen]=useState(false);
  const contact=useContact();
  return <section className="demo-section" aria-label="Mayratic product overview"><div className="site-rail-medium"><div className="demo-frame"><div className="demo-screen"><ProductConsole/><button className="demo-play" onClick={()=>setOpen(true)} aria-label="Play product overview"><span>▶</span></button></div><div className="demo-caption"><span className="eyebrow">FROM IDEA TO EVERYDAY</span><span>Software your team can put to work.</span><button onClick={()=>setOpen(true)}>Explore the overview <Arrow/></button></div></div></div>{open&&<Dialog label="Interactive product overview" onClose={()=>setOpen(false)} className="demo-dialog"><div className="demo-modal-heading"><span className="eyebrow">MAYRATIC / PRODUCT OVERVIEW</span><h2>Built for the work.</h2><p>Explore our product areas. This is an illustrative overview; book a call to see the live products.</p></div><ProductConsole interactive/><div className="demo-modal-footer"><span>Choose Biscon, OrbitLead, or Domora in the sidebar.</span><button className="btn btn-dark" onClick={()=>{setOpen(false);contact("I’d like a live product demonstration.");}}>Book a live demo <Arrow/></button></div></Dialog>}</section>;
}
