"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Arrow } from "./icons";
import { useContact } from "./site-shell";

const questions = [
  {
    text: "Where does the work get stuck?",
    options: [
      "Internal operations and manual processes",
      "Customer experience and online services",
      "Sales, prospecting, and follow-ups",
      "Property and real-estate operations",
    ],
  },
  {
    text: "How does your team work today?",
    options: [
      "Mostly spreadsheets and email",
      "Several tools that don’t connect",
      "One system we’ve outgrown",
      "We’re starting something new",
    ],
  },
  {
    text: "Who will use the software?",
    options: [
      "Our internal team",
      "Our customers",
      "Both our team and customers",
      "We’re still working that out",
    ],
  },
  {
    text: "What would make the biggest difference?",
    options: [
      "Automating repetitive work",
      "Building a better digital experience",
      "Getting one clear view of the business",
      "Launching a new product or service",
    ],
  },
  {
    text: "Where are you in the process?",
    options: [
      "Exploring what’s possible",
      "Ready to define the scope",
      "We have requirements and want to build",
      "We need help with an existing system",
    ],
  },
];

export function Assessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const contact = useContact();
  const done = step === questions.length;
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    // The first question is revealed by PageMotion; animate every change after that.
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".assessment h2, .assessment .eyebrow", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
      gsap.from(".assessment-options button, .assessment-result > *", {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.07,
        delay: 0.12,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, root);
    return () => ctx.revert();
  }, [step]);
  const result =
    answers[0] === 2
      ? {
          title: "Start with a connected sales workflow.",
          body: "OrbitLead is a useful place to explore prospecting, outreach, and follow-ups. A short discovery call can establish whether a ready-made product fits or a custom integration makes more sense.",
          href: "/products/#orbitlead",
          label: "Explore OrbitLead",
        }
      : answers[0] === 3
        ? {
            title: "Start with your property operations.",
            body: "Domora brings property, site, sales, and lease workflows together. Let’s map your existing tools and decide what should connect first.",
            href: "/products/#domora",
            label: "Explore Domora",
          }
        : answers[0] === 1
          ? {
              title: "Start with the customer journey.",
              body: "A focused web platform or mobile application could connect your customers to the work your team already does. We would begin with the key journey, your users, and the smallest useful first release.",
              href: "/services/",
              label: "Explore our services",
            }
          : {
              title:
                answers[3] === 0
                  ? "Start with one useful automation."
                  : "Start with a clearer view of operations.",
              body: "Map the process that takes the most time, the systems involved, and the handoffs that slow your team down. Then compare a focused custom build with the capabilities available in Biscon.",
              href: "/products/#biscon",
              label: "Explore Biscon",
            };
  const message =
    "Project assessment:\n" +
    questions.map((q, i) => `${q.text} ${q.options[answers[i]] || "Not answered"}`).join("\n");
  return (
    <section ref={root} className="assessment" aria-label="Project assessment">
      {!done ? (
        <>
          <div className="assessment-progress" aria-label={`Question ${step + 1} of 5`}>
            {questions.map((_, i) => (
              <span key={i} className={i <= step ? "active" : ""} />
            ))}
          </div>
          <span className="eyebrow">QUESTION {String(step + 1).padStart(2, "0")} / 05</span>
          <h2 aria-live="polite">{questions[step].text}</h2>
          <div className="assessment-options" role="group" aria-label={questions[step].text}>
            {questions[step].options.map((option, i) => (
              <button
                key={option}
                className={answers[step] === i ? "selected" : ""}
                aria-pressed={answers[step] === i}
                onClick={() =>
                  setAnswers((prev) => {
                    const a = [...prev];
                    a[step] = i;
                    return a;
                  })
                }
              >
                {option}
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="assessment-nav">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </button>
            <button
              className="btn btn-dark"
              disabled={answers[step] === undefined}
              onClick={() => setStep((s) => s + 1)}
            >
              {step === 4 ? "See your starting point" : "Continue"}
              <Arrow />
            </button>
          </div>
        </>
      ) : (
        <div className="assessment-result" aria-live="polite">
          <span className="eyebrow">YOUR STARTING POINT</span>
          <h2>{result.title}</h2>
          <p>{result.body}</p>
          <Link href={result.href}>
            {result.label}
            <Arrow />
          </Link>
          <div>
            <button className="btn btn-dark" onClick={() => contact(message)}>
              Talk through your answers <Arrow />
            </button>
          </div>
          <p className="assessment-disclaimer">
            This is an initial suggestion based on your answers, not a technical specification or quote. Your
            answers stay in this browser until you choose to share them.
          </p>
          <button
            className="assessment-restart"
            onClick={() => {
              setStep(0);
              setAnswers([]);
            }}
          >
            Start again ↗
          </button>
        </div>
      )}
    </section>
  );
}
