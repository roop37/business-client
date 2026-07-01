import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ALL_PRODUCTS } from "@/components/marketing/data/nav-products";
import {
  getProductContent,
  getRelatedProducts,
} from "@/components/marketing/data/product-content";
import { ProductBenefits } from "@/components/marketing/product/ProductBenefits";
import { ProductComparison } from "@/components/marketing/product/ProductComparison";
import { ProductFAQ } from "@/components/marketing/product/ProductFAQ";
import { ProductGallery } from "@/components/marketing/product/ProductGallery";
import { ProductHero } from "@/components/marketing/product/ProductHero";
import { ProductHowItWorks } from "@/components/marketing/product/ProductHowItWorks";
import { ProductNarrative } from "@/components/marketing/product/ProductNarrative";
import { ProductRelated } from "@/components/marketing/product/ProductRelated";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ProductJsonLd,
} from "@/components/marketing/seo/SchemaJsonLd";
import { clampDescription } from "@/components/marketing/seo/meta";
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
    // Brand suffix is appended by the root layout title template
    // ("%s · Hoizr"); do not repeat it here or it doubles.
    title: content.label,
    description: clampDescription(content.hero.body),
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
          { name: "Products", href: "/product" },
          { name: content.pillarLabel, href: "/product" },
          { name: content.label, href: `/product/${content.slug}` },
        ]}
      />
      {content.faq?.length ? <FaqJsonLd items={content.faq} /> : null}
      <ProductHero content={content} />
      <ProductBenefits content={content} />
      {content.comparison ? <ProductComparison content={content} /> : null}
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
