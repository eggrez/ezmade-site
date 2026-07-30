import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    title: "Fractal Design",
    slug: "fractal-design",

    category: "3D Product Film",
    year: 2026,

    services: [
      "Direction",
      "3D",
      "Editing",
      "Sound Design",
      "Color Grading",
    ],

    description:
      "EZ led the entire creative and production process behind this 3D film for Fractal Design's North. Every frame was crafted to highlight the product through clean visual storytelling, precise pacing, and refined lighting.",

    hasMedia: true,
    offset: false,
  },

  {
    title: "Yandex Browser",
    slug: "yandex-browser",

    category: "Commercial Campaign",
    year: 2026,

    services: ["Editing"],

    description:
      "Look at the page. Now look to the right. Back to the page. And to the right again. In Yandex Browser's latest campaign, every character keeps looking that way—and encourages you to do the same.",

    hasMedia: true,
    offset: true,
  },

  {
    title: "Neopolis",
    slug: "neopolis",

    category: "Generative Brand Film",
    year: 2026,

    services: [
      "Direction",
      "Editing",
      "Sound Design",
      "Color Grading",
    ],

    description:
      "Created for Neopolis' exhibition showcase, this generative film brings the brand's products to life through dynamic visuals and seamless storytelling. AI-driven workflows, playful animation, and cinematic pacing turned the exhibition experience into an engaging brand story.",

    hasMedia: true,
    offset: false,
  },

  {
    title: "Luma",
    slug: "luma",

    category: "Generative Film",
    year: 2026,

    services: [
      "Editing",
      "Color Grading",
      "Sound Design",
    ],

    description:
      "Created in collaboration with PROTOTYPES, this AI-driven film uses generative storytelling and a cinematic visual language. EZ handled editing, color grading and sound design, shaping the final rhythm, atmosphere and emotional impact of the film.",

    hasMedia: true,
    offset: true,
  },

  {
    title: "Yandex Lavka",
    slug: "yandex-lavka",

    category: "Anniversary Film",
    year: 2026,

    services: [
      "Editing",
      "Sound Design",
    ],

    description:
      "Created to mark Yandex Lavka's fifth anniversary, this film brings the celebration to life through expressive visuals, fluid pacing and a playful cinematic approach. EZ crafted the edit and sound design to shape a vibrant rhythm, balancing energy, emotion and storytelling throughout the film.",

    hasMedia: true,
    offset: false,
  },

  {
    title: "Higgsfield",
    slug: "higgsfield",

    category: "AI Short Film",
    year: 2026,

    services: [
      "Editing",
      "Color Grading",
      "Sound Design",
    ],

    description:
      "Created in collaboration with PROTOTYPES for the Higgsfield competition, this film explores a bold AI-driven visual concept. EZ handled editing, color grading and sound design, bringing rhythm, atmosphere and cohesion to the final film.",

    hasMedia: true,
    offset: true,
  },

  {
    title: "Runway",
    slug: "runway",

    category: "Commercial",
    year: 2026,

    services: [
      "Editing",
      "Sound Design",
      "Color Grading",
    ],

    description:
      "Created in collaboration with PROTOTYPES, this commercial for Runway combines bold visual storytelling with a refined cinematic finish. EZ handled editing, color grading and sound design, shaping the rhythm, tone and final polish of the film.",

    hasMedia: true,
    offset: false,
  },

  {
    title: "T-Bank",
    slug: "t-bank",

    category: "Commercial Campaign",
    year: 2026,

    services: [
      "Editing",
      "Color Grading",
      "Sound Design",
    ],

    description:
      "Created for T-Bank, this commercial campaign delivers a fast-paced and engaging brand story. EZ handled editing, color grading and sound design across both films, shaping their rhythm, energy and final polish.",

    hasMedia: true,
    offset: true,
  },

  {
    title: "INFINOX x Alpine",
    slug: "infinox-x-alpine",

    category: "Commercial",
    year: 2026,

    services: [
      "Editing",
      "Color Grading",
      "Sound Design",
    ],

    description:
      "Created for INFINOX in collaboration with Alpine and Formula 1 driver Jack Doohan, this commercial delivers a fast-paced narrative, brought to its final form through editing, color grading and sound design by EZ.",

    hasMedia: true,
    offset: false,
  },

  {
    title: "Higgsfield II",
    slug: "higgsfield-02",

    category: "AI Film",
    year: 2026,

    services: [
      "Editing",
      "Color Grading",
      "Sound Design",
    ],

    description:
      "Created in collaboration with PROTOTYPES, this cinematic film for Higgsfield builds on a bold AI-driven visual style. EZ was responsible for editing, color grading and sound design, shaping the film's rhythm, mood and final polish.",

    hasMedia: true,
    offset: true,
  },

  {
    title: "My Father Used to Say",
    slug: "my-father-used-to-say",

    category: "Short Film",
    year: 2026,

    services: [
      "Direction",
      "Editing",
      "Sound Design",
      "Color Grading",
    ],

    description:
      "A short film about choice—and whether it truly exists at all. EZ led the entire production from beginning to end, developing the original idea and carrying it through every stage to the final film.",

    hasMedia: true,
    offset: false,
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find(
    (project) => project.slug === slug,
  );
}

export function getPreviousProject(slug: string) {
  const currentIndex = projects.findIndex(
    (project) => project.slug === slug,
  );

  if (currentIndex === -1) {
    return undefined;
  }

  const previousIndex =
    currentIndex === 0
      ? projects.length - 1
      : currentIndex - 1;

  return projects[previousIndex];
}

export function getNextProject(slug: string) {
  const currentIndex = projects.findIndex(
    (project) => project.slug === slug,
  );

  if (currentIndex === -1) {
    return undefined;
  }

  const nextIndex =
    currentIndex === projects.length - 1
      ? 0
      : currentIndex + 1;

  return projects[nextIndex];
}