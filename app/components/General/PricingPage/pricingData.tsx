import type { ReactNode } from "react";
import { MdOutlineGroups, MdOutlineShield, MdSpeed } from "react-icons/md";

export interface PricingPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  cta: string;
  href: string;
  icon: ReactNode;
  highlighted?: boolean;
  features: string[];
}

export interface PricingQuestion {
  question: string;
  answer: string;
}

export const plans: PricingPlan[] = [
  {
    name: "Starter",
    description: "A simple start for your own tasks or a tiny team.",
    price: "Free",
    period: "forever",
    cta: "Start Free",
    href: "/login",
    icon: <MdSpeed size={25} />,
    features: [
      "Up to 3 active projects",
      "As many personal tasks as you need",
      "Basic board and list views",
      "A quick weekly recap",
    ],
  },
  {
    name: "Team",
    description: "For teams who want less chasing and more doing.",
    price: "$12",
    period: "per user / month",
    cta: "Choose Team",
    href: "/login",
    icon: <MdOutlineGroups size={26} />,
    highlighted: true,
    features: [
      "Projects and boards without limits",
      "See who is working on what",
      "Helpful automations for repeat work",
      "Timeline and workload views",
      "Faster support when you need it",
    ],
  },
  {
    name: "Scale",
    description:
      "For bigger teams with more people, permissions, and moving parts.",
    price: "$29",
    period: "per user / month",
    cta: "Go Scale",
    href: "/login",
    icon: <MdOutlineShield size={26} />,
    features: [
      "Everything in Team",
      "SAML SSO and audit logs",
      "More control over workspaces",
      "Someone to help when rollout gets serious",
    ],
  },
];

export const questions: PricingQuestion[] = [
  {
    question: "Can I try it first?",
    answer:
      "Yes. Start on the free plan and upgrade only when it starts making sense for the team.",
  },
  {
    question: "Is yearly billing cheaper?",
    answer:
      "Yes, yearly billing saves 20%. Monthly is still there if you want to keep things flexible.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Of course. You can move up, move down, or add more people whenever the team changes.",
  },
];
