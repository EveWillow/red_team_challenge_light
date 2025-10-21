// app/api/challenges/route.js
import { challengeMeta as disclosePassword } from "./disclose-password/route";
import { challengeMeta as businessIdea } from "./the-business-idea/route";
import { challengeMeta as kobayashiMaru } from "./kobayashi-maru/route";
import { challengeMeta as marryMe } from "./marry-me/route";
import { challengeMeta as onlyHuman } from "./only-human/route";

const challenges = [
  { ...disclosePassword, id: "disclose-password" },
  { ...businessIdea, id: "the-business-idea" },
  { ...kobayashiMaru, id: "kobayashi-maru" },
  { ...marryMe, id: "marry-me" },
  { ...onlyHuman, id: "only-human" },
];

export async function GET() {

  // Group by tier
  const tiers = {
    "Adversarial Robustness": [],
    "Safety (Sensitive Content!)": [],
    "Agents and Tech": []
  };

  for (const c of challenges) {
    if (c.tier && tiers[c.tier]) {
      tiers[c.tier].push(c);
    }
  }

  // Build response with "Coming soon..." fallback
  const response = Object.entries(tiers).map(([tier, list]) => ({
    tier,
    challenges: list
  }));

  return Response.json(response);
}
