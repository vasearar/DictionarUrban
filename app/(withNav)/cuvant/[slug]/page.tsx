import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getWordEntry, slugify } from "@/lib/words";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/site";
import Actions from "@/app/shared/Actions";

// Pagina publică de cuvânt: /cuvant/[slug]
// Agregă toate definițiile vizibile pentru un cuvânt (model Urban Dictionary),
// server-rendered, cu revalidare periodică (ISR) — nu se re-lovește DB-ul la
// fiecare request, dar conținutul rămâne proaspăt.
export const revalidate = 3600; // 1h

interface Props {
  params: Promise<{ slug: string }>;
}

async function resolveSlug(params: Props["params"]): Promise<string | null> {
  const { slug: raw } = await params;
  try {
    return decodeURIComponent(raw).trim() || null;
  } catch {
    return null;
  }
}

/** Rezumat citabil pentru meta description: o singură linie, ~155 caractere. */
function summarize(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const entry = slug ? await getWordEntry(slug) : null;

  if (!entry) {
    return {
      title: "Cuvânt negăsit - DexUrban.md",
      robots: { index: false, follow: true },
    };
  }

  const { word } = entry;
  const canonical = absoluteUrl(`/cuvant/${entry.slug}`);
  const description = summarize(
    `${word} înseamnă: ${entry.definitions[0].definition}`
  );

  return {
    title: `${word} - ce înseamnă ${word} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${word} - ce înseamnă ${word}?`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "ro_RO",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${word} - ce înseamnă ${word}?`,
      description,
    },
  };
}

export default async function Page({ params }: Props) {
  const slug = await resolveSlug(params);
  if (!slug) notFound();

  const entry = await getWordEntry(slug);
  if (!entry) notFound();

  // Normalizează URL-ul la slug-ul canonic (diacritice/majuscule/separatori).
  if (slug !== entry.slug) {
    redirect(`/cuvant/${entry.slug}`);
  }

  const { word, definitions } = entry;
  const canonical = absoluteUrl(`/cuvant/${entry.slug}`);
  const top = definitions[0];

  // JSON-LD: DefinedTerm (schema corectă pentru intrare de dicționar) +
  // BreadcrumbList. Server-rendered, citabil de Google și de LLM-uri.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: word,
        description: summarize(top.definition, 300),
        url: canonical,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: `${SITE_NAME} - dicționar urban de argou și expresii românești`,
          url: SITE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Acasă",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: word,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <div className="px-3 md:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb navigabil (dublează BreadcrumbList din JSON-LD) */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto w-full md:w-[720px] mt-6 mb-4 font-Spacegrotesc text-sm text-myhovergray"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-myorange">
              Acasă
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-bold text-mygray" aria-current="page">
            {word}
          </li>
        </ol>
      </nav>

      <article className="mx-auto mybigdropshadowrounded relative font-Spacegrotesc text-mygray break-words bg-mywhite rounded-md border-2 border-mygray w-full md:w-[720px] p-3 md:p-8 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-4xl break-words text-myorange font-bold mb-4">
          {word}
        </h1>

        {/* Definiție-first, citabilă direct de chatboturi. */}
        <p className="text-base md:text-lg">
          <dfn className="not-italic font-bold">{word}</dfn> înseamnă:{" "}
          {top.definition}
        </p>
      </article>

      <section className="mx-auto w-full md:w-[720px] font-Spacegrotesc">
        <h2 className="text-xl md:text-2xl font-bold text-mygray mb-4 px-1">
          Ce înseamnă {word}?
        </h2>

        <dl>
          {definitions.map((d) => (
            <div
              key={d._id}
              className="mybigdropshadowrounded relative bg-mywhite text-mygray rounded-md border-2 border-mygray p-3 md:p-8 mb-4 md:mb-6"
            >
              <dt className="sr-only">Definiție pentru {word}</dt>
              <dd className="m-0">
                <p className="text-base md:text-lg">{d.definition}</p>
                {d.exampleOfUsing && (
                  <p className="text-base md:text-lg italic my-4">
                    „{d.exampleOfUsing}”
                  </p>
                )}
                <p className="text-base md:text-lg font-bold">
                  de{" "}
                  <Link
                    href={`/profil/${encodeURIComponent(d.username)}`}
                    className="text-myorange mr-2"
                  >
                    {d.username}
                  </Link>
                  {d.date}
                </p>
                <Actions id={d._id} likes={d.likes} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
