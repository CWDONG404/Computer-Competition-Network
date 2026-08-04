import Link from "next/link";
import { kindLabels, scheduleLabel, statusLabels, statusTone, type Listing } from "@/types/listing";

export function ListingCard({ item, wide = false }: { item: Listing; wide?: boolean }) {
  return (
    <Link className={`listing-card ${wide ? "is-wide" : ""}`} href={`/directory/${item.slug}`}>
      <div className="card-meta">
        <span className="card-kind">{kindLabels[item.kind]}</span>
        <span className="status" data-tone={statusTone[item.status]}>{statusLabels[item.status]}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="card-bottom">
        <div>
          <div className="card-tags">
            {item.categories.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
          <p className="mono muted" style={{ marginTop: "var(--space-sm)", fontSize: "var(--text-xs)" }}>
            {scheduleLabel(item)}
          </p>
        </div>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </div>
    </Link>
  );
}
