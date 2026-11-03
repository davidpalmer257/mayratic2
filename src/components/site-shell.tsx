"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { Arrow, Brand, Cross } from "./icons";
import { PageMotion } from "./motion";
import { contactInfo } from "@/lib/site";

const ContactContext = createContext<(message?: string) => void>(() => {});
export const useContact = () => useContext(ContactContext);
const nav = [
  ["Why Mayratic", "/why-mayratic/"],
  ["Services", "/services/"],
  ["AI & Automation", "/ai-automation/"],
  ["Security", "/security/"],
];
const resources = [
  {
    label: "Explore",
    links: [
      ["Our products", "/products/", "Ready-made software for real work."],
      ["How we build", "/getting-started/", "From your first idea to production."],
    ],
  },
  {
    label: "Get started",
    links: [
      ["Project assessment", "/assessment/", "Find the right place to start."],
      ["Free tools", "/tools/", "Practical tools for your next customer."],
    ],
  },
  {
    label: "Let’s talk",
    links: [
      ["Contact Mayratic", "/contact/", "Tell us what you want to build."],
      ["About the studio", "/about/", "Based in Dubai. Working worldwide."],
    ],
  },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [contact, setContact] = useState<string | null>(null);
  const [cookies, setCookies] = useState(false);
  const pathname = usePathname();
  // Close the contact dialog on navigation. Adjusting state while rendering avoids an extra effect pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setContact(null);
  }
  const openContact = useCallback((message = "") => setContact(message), []);
  return (
    <ContactContext.Provider value={openContact}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PageMotion />
      <Header />
      {children}
      <Footer onCookies={() => setCookies(true)} />
      {contact !== null && <ContactDialog initialMessage={contact} onClose={() => setContact(null)} />}
      {cookies && <CookieDialog onClose={() => setCookies(false)} />}
    </ContactContext.Provider>
  );
}

function Header() {
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const contact = useContact();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(false);
    setMobile(false);
  }
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setMenu(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setMobile(false);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
    };
  }, []);
  useEffect(() => {
    if (!(menu || mobile) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panel = root.current?.querySelector(".nav-expanded");
    if (!panel) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      panel,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.35, clearProps: "transform" },
    ).from(
      panel.querySelectorAll("a, button, .eyebrow"),
      { opacity: 0, y: 10, duration: 0.4, stagger: 0.035, clearProps: "opacity,transform" },
      "-=.2",
    );
    return () => {
      tl.kill();
    };
  }, [menu, mobile]);
  return (
    <header ref={root} className={`site-header ${scrolled || menu || mobile ? "is-scrolled" : ""}`}>
      <div className="nav-inner">
        <Link href="/" aria-label="Mayratic home" className="brand-link">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Primary">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={pathname === href ? "current" : ""}>
              {label}
            </Link>
          ))}
          <button
            className={menu ? "nav-resource is-open" : "nav-resource"}
            aria-expanded={menu}
            aria-controls="resources-menu"
            onClick={() => setMenu(!menu)}
          >
            Resources <span aria-hidden="true">⌄</span>
          </button>
        </nav>
        <div className="nav-actions">
          <Link className="nav-products" href="/products/">
            Our products
          </Link>
          <button className="btn btn-dark nav-contact" onClick={() => contact()}>
            Talk to our team <Arrow />
          </button>
          <button
            className="mobile-toggle"
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            aria-expanded={mobile}
            aria-controls="mobile-nav"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? (
              <Cross />
            ) : (
              <span>
                <i />
                <i />
              </span>
            )}
          </button>
        </div>
      </div>
      {menu && (
        <div id="resources-menu" className="resources-menu nav-expanded">
          {resources.map((group) => (
            <div key={group.label}>
              <span className="eyebrow">{group.label}</span>
              {group.links.map(([label, href, description]) => (
                <Link key={href} href={href}>
                  <span>
                    {label}
                    <Arrow />
                  </span>
                  <small>{description}</small>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
      {mobile && (
        <nav id="mobile-nav" data-lenis-prevent className="mobile-nav nav-expanded" aria-label="Mobile">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
              <Arrow />
            </Link>
          ))}
          {resources
            .flatMap((group) => group.links)
            .map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
                <Arrow />
              </Link>
            ))}
          <button
            className="btn btn-dark"
            onClick={() => {
              setMobile(false);
              contact();
            }}
          >
            Talk to our team <Arrow />
          </button>
        </nav>
      )}
    </header>
  );
}

export function Dialog({
  children,
  onClose,
  label,
  className = "",
}: {
  children: React.ReactNode;
  onClose: () => void;
  label: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    const el = dialog.current;
    let tl: gsap.core.Timeline | undefined;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        el,
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, clearProps: "transform" },
      ).from(
        el.querySelectorAll(".contact-intro > *, .field, .form-note, .btn, .eyebrow, h2, p, .cookie-choice"),
        { opacity: 0, y: 14, duration: 0.45, stagger: 0.035, clearProps: "opacity,transform" },
        "-=.3",
      );
    }
    return () => {
      tl?.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  // A click on the dialog's own padding also targets the <dialog>, so compare against its box.
  const closeOnBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return;
    const box = e.currentTarget.getBoundingClientRect();
    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)
      onClose();
  };
  return (
    <dialog
      ref={dialog}
      data-lenis-prevent
      className={`site-dialog ${className}`}
      aria-label={label}
      onCancel={onClose}
      onClick={closeOnBackdrop}
    >
      <button className="dialog-close" aria-label="Close dialog" onClick={onClose}>
        <Cross />
      </button>
      {children}
    </dialog>
  );
}

function ContactDialog({ initialMessage, onClose }: { initialMessage: string; onClose: () => void }) {
  return (
    <Dialog onClose={onClose} label="Talk to the Mayratic team" className="contact-dialog">
      <div className="contact-intro">
        <Brand />
        <div>
          <h2>
            Tell us which process
            <br />
            <span>is costing you the most.</span>
          </h2>
          <p>
            We’ll scope it before you commit to anything. <br />
            Let’s work out what your business needs, <br />
            and what we can build together.
          </p>
        </div>
        <span className="outlined-eyebrow">FROM IDEA TO PRODUCTION</span>
      </div>
      <ContactForm initialMessage={initialMessage} />
    </Dialog>
  );
}

export function ContactForm({ initialMessage = "" }: { initialMessage?: string }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const url = new URL(contactInfo.calendly);
    url.searchParams.set("name", `${data.get("firstName")} ${data.get("lastName")}`);
    url.searchParams.set("email", String(data.get("email")));
    url.searchParams.set(
      "a1",
      [data.get("jobTitle"), data.get("company"), data.get("projectType"), data.get("message")]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.assign(url.toString());
  };
  return (
    <form className="contact-form" onSubmit={submit}>
      <label className="field">
        <span>Business email *</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Business email *"
          aria-label="Business email"
          required
        />
      </label>
      <div className="form-row">
        <label className="field">
          <span>First name *</span>
          <input
            name="firstName"
            autoComplete="given-name"
            placeholder="First name *"
            aria-label="First name"
            required
          />
        </label>
        <label className="field">
          <span>Last name *</span>
          <input
            name="lastName"
            autoComplete="family-name"
            placeholder="Last name *"
            aria-label="Last name"
            required
          />
        </label>
      </div>
      <label className="field">
        <span>Job title</span>
        <input
          name="jobTitle"
          autoComplete="organization-title"
          placeholder="Job title"
          aria-label="Job title"
        />
      </label>
      <label className="field">
        <span>Company name</span>
        <input
          name="company"
          autoComplete="organization"
          placeholder="Company name"
          aria-label="Company name"
        />
      </label>
      <label className="field">
        <span>Project type *</span>
        <select name="projectType" defaultValue="" aria-label="Project type" required>
          <option value="" disabled>
            What would you like to build? *
          </option>
          <option>Website or web platform</option>
          <option>Mobile application</option>
          <option>AI systems & automation</option>
          <option>Ready-made product</option>
          <option>Branding & packaging</option>
        </select>
      </label>
      <label className="field">
        <span>Tell us about your project</span>
        <textarea
          name="message"
          rows={3}
          defaultValue={initialMessage}
          aria-label="Tell us about your project"
          placeholder="Which workflows, tools, or ideas would you like to explore?"
        />
      </label>
      <p className="form-note">
        Continue to Calendly to choose a time. Your details will prefill your booking.
      </p>
      <button className="btn btn-dark" type="submit">
        Choose a time <Arrow />
      </button>
      <a className="contact-phone" href={contactInfo.whatsapp} target="_blank" rel="noreferrer">
        Prefer WhatsApp? +971 58 256 8057 <Arrow />
      </a>
    </form>
  );
}

function Footer({ onCookies }: { onCookies: () => void }) {
  const contact = useContact();
  const columns = [
    [
      "Mayratic",
      ["Why Mayratic", "/why-mayratic/"],
      ["Services", "/services/"],
      ["AI & Automation", "/ai-automation/"],
      ["Security", "/security/"],
      ["Our products", "/products/"],
    ],
    [
      "Resources",
      ["Getting started", "/getting-started/"],
      ["Project assessment", "/assessment/"],
      ["Free tools", "/tools/"],
      ["About us", "/about/"],
    ],
  ] as const;
  return (
    <footer className="site-footer">
      <div className="footer-rail">
        <div className="footer-top">
          {columns.map(([title, ...links]) => (
            <div className="footer-column" key={title}>
              <span className="eyebrow">{title}</span>
              {links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
          <div className="footer-column">
            <span className="eyebrow">Let’s build</span>
            <button onClick={() => contact()}>
              Talk to our team <Arrow />
            </button>
            <a href={contactInfo.calendly} target="_blank" rel="noreferrer">
              Book a call <Arrow />
            </a>
            <a href={contactInfo.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp <Arrow />
            </a>
            <Link href="/contact/">Contact</Link>
          </div>
          <div className="footer-column footer-address">
            <span className="eyebrow">Dubai, UAE</span>
            <p>
              Clover Bay Tower, 8th Floor
              <br />
              Marasi Drive, Business Bay
              <br />
              Dubai, United Arab Emirates
            </p>
            <a href={contactInfo.phoneHref}>+971 58 256 8057</a>
            <span className="availability">
              <i />
              Working worldwide
            </span>
          </div>
        </div>
        <div className="footer-legal">
          <span>©2026 MAYRATIC. ALL RIGHTS RESERVED.</span>
          <div>
            <a href="https://www.mayratic.com/privacy-policy" target="_blank" rel="noreferrer">
              Privacy policy
            </a>
            <a href="https://www.mayratic.com/terms-of-service" target="_blank" rel="noreferrer">
              Terms of service
            </a>
            <button onClick={onCookies}>Cookie settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CookieDialog({ onClose }: { onClose: () => void }) {
  const save = (value: string) => {
    try {
      localStorage.setItem("mayratic-cookie-preference", value);
    } catch {}
    onClose();
  };
  return (
    <Dialog onClose={onClose} label="Cookie preferences" className="cookie-dialog">
      <span className="eyebrow">Your preferences</span>
      <h2>
        A little clarity
        <br />
        about cookies.
      </h2>
      <p>
        This site uses browser storage for your preferences. No optional analytics or advertising cookies are
        enabled.
      </p>
      <label className="cookie-choice">
        Essential preferences <span>Always enabled</span>
      </label>
      <button className="btn btn-dark" onClick={() => save("essential")}>
        Use essential only <Arrow />
      </button>
      <a href="https://www.mayratic.com/cookie-policy" target="_blank" rel="noreferrer">
        Read the cookie policy <Arrow />
      </a>
    </Dialog>
  );
}
