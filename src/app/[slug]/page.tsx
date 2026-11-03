import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-page";
import { pageMeta } from "@/content/pages";

export function generateStaticParams() { return Object.keys(pageMeta).map(slug => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = pageMeta[slug];
  return meta ? { title: meta.title, description: meta.description } : {};
}

export default async function Page({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  if (!pageMeta[slug]) notFound();
  return <ContentPage slug={slug}/>;
}
