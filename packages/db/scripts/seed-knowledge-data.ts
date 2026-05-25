// Seed content for the portfolio knowledge base.
//
// All content is sourced from @portfolio/content — the single source of
// truth shared with apps/web. There are no dev_fixture documents; the
// "AI engineering positioning" gap is now filled by @portfolio/content
// (aiPositioning). The seeder prunes any stale dev_fixture rows from
// previous runs because it filters on metadata.source.

import {
  aiPositioning,
  bioParagraphs,
  contact,
  education,
  experience,
  fullName,
  greeting,
  heroBlurb,
  projects,
  roleTitle,
  skillGroups,
  tagline,
} from "@portfolio/content";
import type { KnowledgeDocumentInput } from "@portfolio/contracts/knowledge";

const REAL_METADATA = {
  isPlaceholder: false,
  source: "existing_portfolio"
} as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Positioning + bio + AI positioning (top-level identity docs)
// ---------------------------------------------------------------------------

const positioningDocument: KnowledgeDocumentInput = {
  title: "Positioning — David Bautista",
  sourceType: "portfolio",
  sourceUri: "@portfolio/content/identity",
  content: [
    `${greeting} ${fullName.first} ${fullName.last}.`,
    `Role: ${roleTitle}.`,
    `Tagline: ${tagline}.`,
    "",
    heroBlurb,
  ].join("\n"),
  metadata: REAL_METADATA,
};

// Bio paragraphs retain their markdown `**bold**` markers; embedding models
// treat them as inert noise, so stripping isn't necessary.
const bioDocument: KnowledgeDocumentInput = {
  title: "Bio — David Bautista",
  sourceType: "portfolio",
  sourceUri: "@portfolio/content/bio",
  content: bioParagraphs.join("\n\n"),
  metadata: REAL_METADATA,
};

const aiPositioningDocument: KnowledgeDocumentInput = {
  title: `Applied AI engineering — ${aiPositioning.headline}`,
  sourceType: "portfolio",
  sourceUri: "@portfolio/content/aiPositioning",
  content: [
    aiPositioning.summary,
    "",
    ...aiPositioning.paragraphs,
    "",
    "Capabilities:",
    ...aiPositioning.capabilities.map((c) => `- ${c}`),
  ].join("\n"),
  metadata: REAL_METADATA,
};

// ---------------------------------------------------------------------------
// Skills — one document per category. Mirrors the "Primary stack" pattern
// from the previous seed: standalone, well-titled docs raise retrieval
// precision for category-specific queries ("what testing tools…?").
// ---------------------------------------------------------------------------

const skillsDocuments: KnowledgeDocumentInput[] = skillGroups.map((group) => ({
  title: `Skills — ${group.category}`,
  sourceType: "skill",
  sourceUri: `@portfolio/content/skills#${slugify(group.category)}`,
  content: [`${group.category}:`, ...group.items.map((item) => `- ${item}`)].join("\n"),
  metadata: {
    ...REAL_METADATA,
    category: group.category,
  },
}));

// ---------------------------------------------------------------------------
// Experience — one summary doc + one document per role.
// ---------------------------------------------------------------------------

const experienceSummary: KnowledgeDocumentInput = {
  title: "Experience summary",
  sourceType: "portfolio",
  sourceUri: "@portfolio/content/experience",
  content: [
    "Work history (most recent first):",
    "",
    ...experience.map(
      (role) => `- ${role.title} at ${role.company} (${role.period})`,
    ),
  ].join("\n"),
  metadata: REAL_METADATA,
};

const experienceDocuments: KnowledgeDocumentInput[] = experience.map((role) => {
  const slug = `${slugify(role.company)}-${slugify(role.period)}-${slugify(role.title)}`;
  return {
    title: `${role.title} — ${role.company} (${role.period})`,
    sourceType: "experience",
    sourceUri: `@portfolio/content/experience#${slug}`,
    content: [
      `${role.title} at ${role.company}`,
      `Period: ${role.period}`,
      "",
      ...role.bullets.map((bullet) => `- ${bullet}`),
    ].join("\n"),
    metadata: {
      ...REAL_METADATA,
      company: role.company,
      title: role.title,
      period: role.period,
      slug,
    },
  };
});

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

const educationDocument: KnowledgeDocumentInput = {
  title: "Education",
  sourceType: "portfolio",
  sourceUri: "@portfolio/content/education",
  content: [
    "Education:",
    "",
    ...education.map(
      (entry) => `- ${entry.degree} — ${entry.school} (${entry.period})`,
    ),
  ].join("\n"),
  metadata: REAL_METADATA,
};

// ---------------------------------------------------------------------------
// Featured projects — one document per project (8 total).
// ---------------------------------------------------------------------------

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
      project.description,
    ].join("\n"),
    metadata: {
      ...REAL_METADATA,
      role: project.role,
      company: project.company,
      year: project.year,
      slug,
    },
  };
});

// ---------------------------------------------------------------------------
// Contact — no Twitter, no WhatsApp (gated behind env var in the UI).
// ---------------------------------------------------------------------------

const contactDocument: KnowledgeDocumentInput = {
  title: "Contact channels",
  sourceType: "portfolio",
  sourceUri: "@portfolio/content/contact",
  content: [
    "Reach out — David is open to new opportunities and collaborations.",
    "",
    `Email: ${contact.email}`,
    `GitHub: ${contact.github.url} (handle: ${contact.github.handle})`,
    `LinkedIn: ${contact.linkedin.url} (${contact.linkedin.name})`,
    `Portfolio: ${contact.portfolio.url}`,
    `Resume: ${contact.resumePath}`,
  ].join("\n"),
  metadata: REAL_METADATA,
};

// ---------------------------------------------------------------------------
// Final corpus
// ---------------------------------------------------------------------------

export const realPortfolioDocuments: KnowledgeDocumentInput[] = [
  positioningDocument,
  bioDocument,
  aiPositioningDocument,
  ...skillsDocuments,
  experienceSummary,
  ...experienceDocuments,
  educationDocument,
  ...projectDocuments,
  contactDocument,
];

export const allSeedDocuments: KnowledgeDocumentInput[] = realPortfolioDocuments;
