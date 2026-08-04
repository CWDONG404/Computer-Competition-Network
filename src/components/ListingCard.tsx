import Link from "next/link";
import {
  kindLabels,
  scheduleLabel,
  statusLabels,
  statusTone,
  type ListingWithEvidence
} from "@/types/listing";

export function ListingCard({ item }: { item: ListingWithEvidence }) {
  return (
    <Link className="listing-row" href={`/directory/${item.slug}`}>
      <div className="listing-row__status">
        <span className="status" data-tone={statusTone[item.status]}>{statusLabels[item.status]}</span>
        <span className="listing-row__date">{scheduleLabel(item)}</span>
      </div>
      <div className="listing-row__main">
        <div className="listing-row__titleline">
          <h3>{item.title}</h3>
          <span className="kind-label">{kindLabels[item.kind]}</span>
        </div>
        <p>{item.summary}</p>
        <div className="chip-line">
          {item.categories.slice(0, 2).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          {item.evidence?.slice(0, 2).map((evidence) => <span className="evidence-tag" key={evidence.code}>{evidence.label}</span>)}
        </div>
      </div>
      <span className="listing-row__arrow" aria-hidden="true">→</span>
    </Link>
  );
}
