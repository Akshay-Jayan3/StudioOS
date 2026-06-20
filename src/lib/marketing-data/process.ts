import {
  Search,
  PencilRuler,
  DraftingCompass,
  CheckCircle2,
} from "lucide-react";

export const steps = [
  {
    step: "01",
    title: "Discover",
    duration: "Week 1",
    description:
      "We understand your lifestyle, requirements, budget, and spatial constraints.",
    icon: Search,
  },
  {
    step: "02",
    title: "Design",
    duration: "Week 2–4",
    description:
      "Concept development, layouts, materials, lighting, and visual direction.",
    icon: PencilRuler,
  },
  {
    step: "03",
    title: "Develop",
    duration: "Week 5–8",
    description:
      "Detailed drawings, coordination, approvals, and execution planning.",
    icon: DraftingCompass,
  },
  {
    step: "04",
    title: "Deliver",
    duration: "Month 3–6",
    description:
      "Execution, quality checks, final styling, and seamless handover.",
    icon: CheckCircle2,
  },
];
