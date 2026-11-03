"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Arrow } from "./icons";
import { useContact } from "./site-shell";

export type Product = {
  name: string;
  category: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  cta: string;
  /** External destination. Omitted when the call to action opens the contact dialog instead. */
  href?: string;
  /** Pre-filled message for the contact dialog. */
  contactMessage?: string;
};

export const products: Product[] = [
  {
    name: "Biscon",
    category: "BUSINESS OPERATIONS",
    title: "Your business. One system.",
    image: "/usecase-cover/retail.webp",
    alt: "A bright retail store with customers and clothing displays",
    description:
      "Unify suppliers, inventory, POS, HR, accounting, and analytics in one AI-powered platform. One command centre for your day-to-day operations.",
    href: "https://biscon.app",
    cta: "Explore Biscon",
  },
  {
    name: "OrbitLead",
    category: "SALES & OUTREACH",
    title: "Your tireless sales rep.",
    image: "/usecase-cover/go-to-market.webp",
    alt: "A sales team reviewing a pipeline in a meeting room",
    description:
      "Automate prospecting, personalised outreach, and follow-ups. Keep your pipeline moving while your team focuses on the conversations that matter.",
    contactMessage: "I’d like to see OrbitLead in action.",
    cta: "Book an OrbitLead demo",
  },
  {
    name: "Domora",
    category: "REAL ESTATE",
    title: "A clearer view of property.",
    image: "/usecase-cover/manufacture.webp",
    alt: "An operations team monitoring connected sites",
    description:
      "Manage sites, properties, sales, and lease agreements with intelligent automation. Bring your real-estate operations into one connected platform.",
    href: "https://domora.mayratic.com",
    cta: "Explore Domora",
  },
];

export function ProductCarousel() {
  const [active, setActive] = useState(1);
  const pointer = useRef<number | null>(null);
  const contact = useContact();
  const next = (direction: number) => setActive((n) => (n + direction + 3) % 3);
  return (
    <section className="products-section" aria-label="Mayratic products">
      <div className="site-rail-medium">
        <h2>
          Three products.
          <br />
          Real work, connected.
        </h2>
      </div>
      <div
        className="product-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Our products"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            next(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            next(-1);
          }
        }}
        onPointerDown={(e) => {
          pointer.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (pointer.current !== null && Math.abs(e.clientX - pointer.current) > 50)
            next(e.clientX < pointer.current ? 1 : -1);
          pointer.current = null;
        }}
      >
        <div
          className="product-track"
          style={{
            transform: `translateX(calc(-50% - ${active - 1} * (var(--product-width) + var(--product-gap))))`,
          }}
        >
          {products.map((product, i) => (
            <article
              key={product.name}
              className={`product-card ${active === i ? "active" : ""}`}
              aria-label={product.name}
              aria-hidden={active !== i}
            >
              <div className="product-category">
                <i />
                {product.category}
              </div>
              <div className="product-image">
                <img src={product.image} alt={product.alt} loading="lazy" draggable={false} />
                <span>{product.title}</span>
                {i !== active && (
                  <button tabIndex={-1} aria-label={`Show ${product.name}`} onClick={() => setActive(i)}>
                    <Arrow />
                  </button>
                )}
              </div>
              <div className="product-description">
                <p>{product.description}</p>
                {product.contactMessage ? (
                  <button onClick={() => contact(product.contactMessage)} tabIndex={active === i ? 0 : -1}>
                    {product.cta}
                    <Arrow />
                  </button>
                ) : (
                  <a href={product.href} target="_blank" rel="noreferrer" tabIndex={active === i ? 0 : -1}>
                    {product.cta}
                    <Arrow />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="carousel-controls">
        <button aria-label="Previous product" onClick={() => next(-1)}>
          <Arrow />
        </button>
        <div aria-label="Choose a product">
          {products.map((p, i) => (
            <button
              key={p.name}
              aria-label={`Show ${p.name}`}
              aria-pressed={active === i}
              className={active === i ? "active" : ""}
              onClick={() => setActive(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button aria-label="Next product" onClick={() => next(1)}>
          <Arrow />
        </button>
      </div>
      <div className="products-all">
        <Link href="/products/">
          Explore all products <Arrow />
        </Link>
      </div>
    </section>
  );
}
