import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-page";
import { pageMeta } from "@/content/pages";

export function generateStaticParams() {
  return Object.keys(pageMeta).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = pageMeta[slug];
  if (!meta) return {};
  const url = `/${slug}/`;
  return {
    // Some page titles already contain the brand; skip the "— Mayratic" suffix for those.
    title: meta.title.includes("Mayratic") ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: { title: meta.title, description: meta.description, url },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!pageMeta[slug]) notFound();
  return <ContentPage key={slug} slug={slug} />;
}
