type ProjectPlaceholderProps = {
  title: string;
};

export default function ProjectPlaceholder({
  title,
}: ProjectPlaceholderProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-200">
      <div className="text-center">
        <p className="text-5xl font-medium tracking-[-0.08em] text-neutral-400">
          EZ
        </p>

        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          {title}
        </p>
      </div>
    </div>
  );
}