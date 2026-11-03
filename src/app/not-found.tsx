import Link from "next/link";
import { Arrow } from "@/components/icons";
export default function NotFound() {
  return (
    <main id="main" className="not-found site-rail-medium">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>
        This page
        <br />
        isn’t here.
      </h1>
      <p>Let’s get you back to something useful.</p>
      <Link href="/" className="btn btn-dark">
        Back to Mayratic <Arrow />
      </Link>
    </main>
  );
}
