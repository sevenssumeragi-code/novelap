"""bb-theater コマンド。"""

from __future__ import annotations

import argparse

import uvicorn


def main() -> None:
    parser = argparse.ArgumentParser(description="BB劇場メーカー Web UI を起動する")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8010)
    args = parser.parse_args()
    uvicorn.run("bb_theater.server:app", host=args.host, port=args.port)


if __name__ == "__main__":
    main()
