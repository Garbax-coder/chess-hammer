"""Stratified reservoir sampling of the Lichess puzzle CSV dump, by rating bucket.

Reads the full ~6.1M row lichess_db_puzzle.csv, keeps at most CAP_PER_BUCKET
puzzles per BUCKET_WIDTH-point rating bucket (uniform reservoir sampling per
bucket, single pass), and writes a Postgres COPY-ready CSV with Moves/Themes/
OpeningTags converted to Postgres array literals.
"""

import csv
import random
import sys

BUCKET_WIDTH = 25
CAP_PER_BUCKET = 2000
SEED = 42

IN_PATH = "lichess_db_puzzle.csv"
OUT_PATH = "sampled_puzzles.csv"

random.seed(SEED)
csv.field_size_limit(sys.maxsize)


def to_pg_array(raw: str) -> str:
    items = raw.split() if raw else []
    escaped = [item.replace("\\", "\\\\").replace('"', '\\"') for item in items]
    return "{" + ",".join(f'"{item}"' for item in escaped) + "}"


def main() -> None:
    reservoirs: dict[int, list[dict]] = {}
    seen_counts: dict[int, int] = {}

    with open(IN_PATH, newline="", encoding="utf-8") as f_in:
        reader = csv.DictReader(f_in)
        for i, row in enumerate(reader, start=1):
            rating = int(row["Rating"])
            bucket = rating - (rating % BUCKET_WIDTH)

            seen = seen_counts.get(bucket, 0) + 1
            seen_counts[bucket] = seen
            reservoir = reservoirs.setdefault(bucket, [])

            if len(reservoir) < CAP_PER_BUCKET:
                reservoir.append(row)
            else:
                j = random.randint(1, seen)
                if j <= CAP_PER_BUCKET:
                    reservoir[j - 1] = row

            if i % 500_000 == 0:
                print(f"...processed {i:,} rows", file=sys.stderr)

    total = sum(len(r) for r in reservoirs.values())
    print(f"Sampled {total:,} puzzles across {len(reservoirs)} rating buckets", file=sys.stderr)

    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f_out:
        writer = csv.writer(f_out)
        writer.writerow(
            [
                "puzzle_id",
                "fen",
                "moves",
                "rating",
                "rating_deviation",
                "popularity",
                "nb_plays",
                "themes",
                "game_url",
                "opening_tags",
            ]
        )
        for bucket in sorted(reservoirs):
            for row in reservoirs[bucket]:
                writer.writerow(
                    [
                        row["PuzzleId"],
                        row["FEN"],
                        to_pg_array(row["Moves"]),
                        row["Rating"],
                        row["RatingDeviation"],
                        row["Popularity"],
                        row["NbPlays"],
                        to_pg_array(row["Themes"]),
                        row["GameUrl"],
                        to_pg_array(row["OpeningTags"]),
                    ]
                )

    print(f"Wrote {OUT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
