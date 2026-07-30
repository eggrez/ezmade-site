export const disciplineSlugs = [
  "direction",
  "color-grading",
  "editing",
  "sound-design",
  "3d",
] as const;

export type DisciplineSlug = (typeof disciplineSlugs)[number];

export type Discipline = {
  slug: DisciplineSlug;
  title: string;
  projectService: string;
  desktopPosition:
    | "left"
    | "center-right"
    | "center-left"
    | "right"
    | "center";
  mobileIndent: "none" | "small" | "medium";
};

export const disciplines: Discipline[] = [
  {
    slug: "direction",
    title: "Direction",
    projectService: "Direction",
    desktopPosition: "left",
    mobileIndent: "none",
  },
  {
    slug: "color-grading",
    title: "Color Grading",
    projectService: "Color Grading",
    desktopPosition: "center-right",
    mobileIndent: "small",
  },
  {
    slug: "editing",
    title: "Editing",
    projectService: "Editing",
    desktopPosition: "center-left",
    mobileIndent: "none",
  },
  {
    slug: "sound-design",
    title: "Sound Design",
    projectService: "Sound Design",
    desktopPosition: "right",
    mobileIndent: "small",
  },
  {
    slug: "3d",
    title: "3D",
    projectService: "3D",
    desktopPosition: "center",
    mobileIndent: "medium",
  },
];

export function getDisciplineBySlug(slug: string) {
  return disciplines.find(
    (discipline) => discipline.slug === slug,
  );
}