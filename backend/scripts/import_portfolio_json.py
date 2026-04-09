#!/usr/bin/env python3
"""
Import portfolio from UI export JSON into local SQLite (unset DATABASE_URL).

Usage (from repo root):
  cd backend && source venv/bin/activate && python scripts/import_portfolio_json.py
  python scripts/import_portfolio_json.py --json ../gsayantan1999_assets.json --password YourPassword
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Use local SQLite only
os.environ.pop("DATABASE_URL", None)

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy.orm import Session  # noqa: E402

from database import SessionLocal, engine, Base  # noqa: E402
from models import User, Tag, Item, Entry  # noqa: E402
from auth import get_user_by_email, create_user, UserCreate  # noqa: E402

TAG_COLORS = {
    "Stocks": "#3b82f6",
    "Retirement": "#10b981",
    "Mutual Funds": "#8b5cf6",
    "Savings": "#f59e0b",
    "Physical Assets": "#ec4899",
    "Insurance": "#06b6d4",
    "Credit Card": "#ef4444",
}


def parse_date(s: str) -> datetime:
    s = s.strip()[:10]
    return datetime.strptime(s, "%Y-%m-%d")


def get_or_create_user(db: Session, email: str, name: str, password: str) -> User:
    u = get_user_by_email(db, email)
    if u:
        return u
    return create_user(db, UserCreate(email=email, name=name, password=password))


def clear_user_portfolio(db: Session, user_id: int) -> None:
    items = db.query(Item).filter(Item.user_id == user_id).all()
    for item in items:
        db.delete(item)
    tags = db.query(Tag).filter(Tag.user_id == user_id).all()
    for tag in tags:
        db.delete(tag)
    db.commit()


def ensure_tag(db: Session, user_id: int, name: str) -> Tag:
    t = db.query(Tag).filter(Tag.user_id == user_id, Tag.name == name).first()
    if t:
        return t
    color = TAG_COLORS.get(name, "#6366f1")
    t = Tag(user_id=user_id, name=name, color=color)
    db.add(t)
    db.flush()
    return t


def import_payload(db: Session, user: User, data: dict) -> None:
    tag_cache: dict[str, Tag] = {}

    def tags_for(names: list[str]) -> list[Tag]:
        out = []
        for n in names:
            if n not in tag_cache:
                tag_cache[n] = ensure_tag(db, user.id, n)
            out.append(tag_cache[n])
        return out

    for bucket, typ in (("assets", "asset"), ("liabilities", "liability")):
        for row in data.get(bucket, []):
            name = row["name"]
            currency = row.get("currency") or "INR"
            item = Item(
                user_id=user.id,
                name=name,
                type=typ,
                currency=currency,
            )
            tag_names = row.get("tags") or []
            item.tags = tags_for(tag_names)
            db.add(item)
            db.flush()

            for ent in sorted(row.get("entries") or [], key=lambda e: (e["date"], e.get("amount", 0))):
                db.add(
                    Entry(
                        item_id=item.id,
                        amount=float(ent["amount"]),
                        date=parse_date(ent["date"]),
                    )
                )

    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Import portfolio JSON into local SQLite")
    parser.add_argument(
        "--json",
        type=Path,
        default=BACKEND_ROOT.parent / "gsayantan1999_assets.json",
        help="Path to export JSON",
    )
    parser.add_argument(
        "--password",
        default="Sayantan1999",
        help="Password for user if created (default: Sayantan1999)",
    )
    parser.add_argument(
        "--no-replace",
        action="store_true",
        help="Do not clear existing items/tags first (may duplicate items)",
    )
    args = parser.parse_args()
    replace = not args.no_replace

    path = args.json.resolve()
    if not path.is_file():
        print(f"File not found: {path}", file=sys.stderr)
        sys.exit(1)

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    email = data.get("user_email") or "user@example.com"
    name = data.get("user_name") or email.split("@")[0] or "User"

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = get_or_create_user(db, email, name, args.password)
        db.commit()
        if replace:
            clear_user_portfolio(db, user.id)
        import_payload(db, user, data)
        n_items = db.query(Item).filter(Item.user_id == user.id).count()
        n_entries = (
            db.query(Entry).join(Item).filter(Item.user_id == user.id).count()
        )
        print(f"OK user={email} (id={user.id}) items={n_items} entries={n_entries}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
