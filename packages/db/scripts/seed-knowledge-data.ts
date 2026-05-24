// Seed content for the portfolio knowledge base.
//
// All real content is sourced from @portfolio/content — the single source
// of truth shared with apps/web. devFixtureDocuments exists only to
// exercise ingestion for topics the portfolio does not yet document
// (e.g. AI engineering positioning); delete each fixture when real copy
// lands.

import {
  bioParagraphs,
  contact,
  fullName,
  greeting,
  projects,
  tagline,
} from "@portfolio/content";
import type { KnowledgeDocumentInput } from "@portfolio/contracts/knowledge";

const REAL_METADATA = {
  isPlaceholder: false,
  source: "existing_portfolio"
} as const;

const FIXTURE_METADATA = {
  isPlaceholder: true,
  source: "dev_fixture"
} as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const projectDocuments: KnowledgeDocumentInput[] = projects.map((project) => {
  const slug = `${slugify(project.company)}-${slugify(project.year)}-${slugify(project.title)}`;
  return {
    title: `${project.title} (${project.company}, ${project.year})`,
    sourceType: "project",
    sourceUri: `@portfolio/content/projects#${slug}`,
    content: [
      project.title,
      `Role: ${project.role}`,
      `Company: ${project.company}`,
      `Years: ${project.year}`,
      "",
      project.description
    ].join("\n"),
    metadata: {
      ...REAL_METADATA,
      role: project.role,
      company: project.company,
      year: project.year,
      slug
    }
  };
});

// Bio paragraphs retain their markdown `**bold**` markers; embedding
// models treat them as inert noise, so stripping isn't necessary.
const aboutBioContent = bioParagraphs.join("\n\n");

const portfolioDocuments: KnowledgeDocumentInput[] = [
  {
    title: "Bio — David Bautista",
    sourceType: "portfolio",
    sourceUri: "@portfolio/content/bio",
    content: aboutBioContent,
    metadata: REAL_METADATA
  },
  {
    title: "Tagline — David Bautista",
    sourceType: "portfolio",
    sourceUri: "@portfolio/content/identity",
    content: `${greeting} ${fullName.first} ${fullName.last}. ${tagline}.`,
    metadata: REAL_METADATA
  },
  {
    title: "Contact channels",
    sourceType: "portfolio",
    sourceUri: "@portfolio/content/contact",
    content: [
      "Let's connect — David is always open to new opportunities and collaborations.",
      "",
      `Email: ${contact.email}`,
      `GitHub: ${contact.github.url} (handle: ${contact.github.handle})`,
      `LinkedIn: ${contact.linkedin.url} (${contact.linkedin.name})`,
      `Resume: ${contact.resumePath}`
    ].join("\n"),
    metadata: REAL_METADATA
  }
];

// Stack-focused doc so retrieval can answer "what is David's stack?"
// precisely. Mirrors the stack paragraph from @portfolio/content/bio verbatim.
const skillsDocuments: KnowledgeDocumentInput[] = [
  {
    title: "Primary stack",
    sourceType: "skill",
    sourceUri: "@portfolio/content/bio#stack",
    content: bioParagraphs[1] ?? "",
    metadata: REAL_METADATA
  }
];

export const realPortfolioDocuments: KnowledgeDocumentInput[] = [...portfolioDocuments, ...projectDocuments, ...skillsDocuments];

// Placeholders. Used only because the portfolio does not yet document
// these topics. Remove each fixture as soon as real copy exists.
export const devFixtureDocuments: KnowledgeDocumentInput[] = [
  {
    title: "AI engineering positioning (placeholder)",
    sourceType: "dev_fixture",
    sourceUri: "packages/db/scripts/seed-knowledge-data.ts#ai-positioning",
    content:
      "AI engineering positioning placeholder — replace with real positioning copy before demo. This document exists only to exercise the dev_fixture ingestion path; do not treat its contents as truthful portfolio claims.",
    metadata: FIXTURE_METADATA
  }
];

export const allSeedDocuments: KnowledgeDocumentInput[] = [...realPortfolioDocuments, ...devFixtureDocuments];
