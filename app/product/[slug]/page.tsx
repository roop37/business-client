import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ALL_PRODUCTS } from "@/components/marketing/data/nav-products";
import {
  getProductContent,
  getRelatedProducts,
} from "@/components/marketing/data/product-content";
import { ProductBenefits } from "@/components/marketing/product/ProductBenefits";
import { ProductFAQ } from "@/components/marketing/product/ProductFAQ";
import { ProductGallery } from "@/components/marketing/product/ProductGallery";
import { ProductHero } from "@/components/marketing/product/ProductHero";
import { ProductHowItWorks } from "@/components/marketing/product/ProductHowItWorks";
import { ProductNarrative } from "@/components/marketing/product/ProductNarrative";
import { ProductRelated } from "@/components/marketing/product/ProductRelated";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import {
  BreadcrumbJsonLd,
  ProductJsonLd,
} from "@/components/marketing/seo/SchemaJsonLd";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

type PageParams = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const content = getProductContent(params.slug);
  if (!content) {
    return { title: "Product not found" };
  }
  const canonical = `/product/${content.slug}`;
  return {
    title: `${content.label} — Hoizr`,
    description: content.hero.body,
    alternates: { canonical },
    openGraph: {
      title: `${content.label} — Hoizr`,
      description: content.hero.body,
      url: canonical,
      type: "website",
      images: [
        {
          url: "/opengraph-image.webp",
          width: 1200,
          height: 630,
          alt: `${content.label} — Hoizr`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${content.label} — Hoizr`,
      description: content.hero.body,
      images: ["/opengraph-image.webp"],
    },
  };
}

export default function ProductPage({ params }: PageParams) {
  const content = getProductContent(params.slug);
  if (!content) notFound();
  const related = getRelatedProducts(params.slug);

  return (
    <MarketingShell>
      <ProductJsonLd content={content} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: content.pillarLabel, href: "/#products" },
          { name: content.label, href: `/product/${content.slug}` },
        ]}
      />
      <ProductHero content={content} />
      <ProductBenefits content={content} />
      <ProductNarrative content={content} />
      <ProductGallery content={content} related={related} />
      <ProductHowItWorks content={content} />
      <ProductFAQ content={content} />
      <Beliefs />
      <ProductRelated pillarLabel={content.pillarLabel} related={related} />
      <FinalCTA />
    </MarketingShell>
  );
}
