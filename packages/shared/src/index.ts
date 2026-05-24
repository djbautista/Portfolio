export * from "./common.js";
export * from "./channel.js";

// Twilio-specific schemas are intentionally NOT re-exported here. Import them
// via the subpath `@portfolio/shared/twilio` from edge-adapter code only —
// see docs/architecture.md.
