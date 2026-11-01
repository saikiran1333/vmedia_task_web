import { SkeletonGrid } from "@/features/catalog/presentation/state-message";

export default function Loading() {
  return (
    <div className="tg-wrap tg-section">
      <div className="tg-skeleton tg-skeleton-title" />
      <SkeletonGrid />
    </div>
  );
}
