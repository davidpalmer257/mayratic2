"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import sections from "@/content/home-sections.json";
import { Arrow } from "./icons";
import { HeroStack } from "./hero-stack";
import { useContact } from "./site-shell";
import { DemoSection } from "./product-demo";
import { ProductCarousel } from "./products";

gsap.registerPlugin(ScrollTrigger);

export function ContentSection({ html }: { html: string }) { return <div className="content-fragment" dangerouslySetInnerHTML={{ __html: html }}/>; }

export function Home() {
  const root=useRef<HTMLElement>(null);
  const contact=useContact();
  useEffect(()=>{
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced)return;
    const context=gsap.context(()=>{
      gsap.fromTo(".home-hero h1, .home-hero .hero-subhead, .home-hero .hero-actions", {opacity:0,y:20},{opacity:1,y:0,stagger:.12,duration:.9,ease:"power3.out",delay:.1});
      gsap.fromTo(".context-stack",{opacity:0},{opacity:1,duration:1.4,delay:.3});
      gsap.utils.toArray<HTMLElement>(".content-fragment > section > div, .demo-frame, .products-section h2").forEach(el=>gsap.fromTo(el,{opacity:0,y:22},{opacity:1,y:0,duration:.85,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 93%",once:true}}));
      gsap.utils.toArray<SVGPathElement>(".mayratic-fig__curve").forEach(path=>gsap.fromTo(path,{strokeDasharray:"0 1"},{strokeDasharray:"1 1",duration:2,scrollTrigger:{trigger:path,start:"top 90%",once:true},ease:"power2.inOut"}));
      gsap.fromTo("[data-chat-step]",{opacity:0,y:12},{opacity:1,y:0,duration:.6,stagger:.8,ease:"power2.out",scrollTrigger:{trigger:".build-chat",start:"top 85%",once:true}});
    },root);
    const timer=window.setTimeout(()=>ScrollTrigger.refresh(),500);
    return()=>{clearTimeout(timer);context.revert();};
  },[]);
  return <main id="main" ref={root} className="home-main" onClick={e=>{const target=(e.target as HTMLElement).closest("button");if(target?.textContent?.includes("Talk to our team"))contact();}}>
    <div className="first-viewport"><section className="home-hero" aria-label="Intelligent software is here"><div className="hero-layout"><div className="hero-copy"><h1>Intelligent<br className="desktop-break"/> software<br/>is here.</h1><p className="hero-subhead">From the first idea to a production-ready product. We design, build, and ship intelligent software around how your business actually works.</p><div className="hero-actions"><button className="btn btn-dark" onClick={()=>contact()}>Talk to our team <Arrow/></button><Link className="btn btn-outline" href="/services/">See how we build</Link></div></div><div className="hero-visual"><HeroStack/></div></div></section><ProofBand/></div>
    <ContentSection html={sections.problem}/>
    <ContentSection html={sections.comparison}/>
    <DemoSection/>
    <ContentSection html={sections.growth}/>
    <ContentSection html={sections.security}/>
    <ProductCarousel/>
    <ContentSection html={sections.final}/>
  </main>;
}

function ProofBand() {
  return <section className="proof-band" aria-label="Software made by Mayratic"><div className="proof-rail"><div className="proof-products"><span className="eyebrow">BUILT TO RUN YOUR BUSINESS</span><div>{[["Biscon","/products/#biscon"],["OrbitLead","/products/#orbitlead"],["Domora","/products/#domora"]].map(([label,href],i)=><Link key={label} href={href}><span className={`product-symbol symbol-${i}`}>{["◈","↗","▦"][i]}</span>{label}</Link>)}</div></div><div className="proof-location"><span className="eyebrow">BASED IN DUBAI</span><div><i/>Working worldwide <span>↗</span></div></div></div></section>;
}
