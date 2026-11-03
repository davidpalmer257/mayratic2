# Mayratic


## Run

```sh
npm install
npm run dev
```

Open the local address printed by Next.js. For a production build:

```sh
npm run typecheck
npm run build
```

The static export is written to `out/`. It can be hosted without a Node.js server. Routes use trailing slashes.

## Structure

- `src/components/home.tsx`: homepage composition and GSAP scroll reveals.
- `src/components/hero-stack.tsx`: animated canvas layers and interactive build-phase control.
- `src/content/home-sections.json`: adapted reference section markup, including the detailed SVG illustrations. This is trusted, local content; do not populate it with untrusted input.
- `src/styles/design-system.css`: reference layout, design tokens, typography, and measured utility styles.
- `src/styles/globals.css`: Mayratic components, navigation, responsive layouts, and reduced-motion rules.
- `src/components/site-shell.tsx`: desktop and mobile navigation, contact dialog, booking form, footer, and cookie preferences.
- `src/content/pages.ts`: services, process, FAQs, and page metadata.
- `src/components/content-page.tsx`: the ten linked content pages.
- `src/components/assessment.tsx`: five-step project assessment and contact prefill.

## Booking and product links

The booking form opens Mayratic’s existing Calendly link. Name, email, and project context are passed as prefilled booking fields. The first custom Calendly answer uses `a1`; confirm that the event’s first custom question remains the project-context question if the event is edited.

Product links, WhatsApp, telephone, existing free tools, and legal policies use Mayratic’s current public destinations. The website contains no new email delivery service or database. The product console is clearly labelled as an illustrative overview, with a CTA to book a live demonstration.

## Design reference



## Hosting


Set `NEXT_PUBLIC_SITE_URL=https://www.mayratic.com` when building for the live domain so metadata, the sitemap, and robots.txt use the production origin.
