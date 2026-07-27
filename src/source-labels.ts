import { basename, normalize, parse, sep } from 'node:path';

function pathSegments(path: string): string[] {
  const normalized = normalize(path);
  const root = parse(normalized).root;
  return normalized.slice(root.length).split(sep).filter(Boolean);
}

export function createSourceLabels(paths: string[]): string[] {
  const segments = paths.map(pathSegments);
  const depths = paths.map(() => 1);

  for (let index = 0; index < paths.length; index += 1) {
    while (depths[index] < segments[index].length) {
      const candidate = segments[index].slice(-depths[index]).join('/');
      const isUnique = segments.every((other, otherIndex) =>
        otherIndex === index ||
        other.join('/') === segments[index].join('/') ||
        other.slice(-depths[index]).join('/') !== candidate
      );
      if (isUnique) break;
      depths[index] += 1;
    }
  }

  const labels = paths.map((path, index) =>
    segments[index].slice(-depths[index]).join('/') || basename(path)
  );
  const totals = new Map<string, number>();
  labels.forEach((label) => totals.set(label, (totals.get(label) ?? 0) + 1));
  const occurrences = new Map<string, number>();

  return labels.map((label) => {
    if ((totals.get(label) ?? 0) === 1) return label;
    const occurrence = (occurrences.get(label) ?? 0) + 1;
    occurrences.set(label, occurrence);
    return `${label}#${occurrence}`;
  });
}
