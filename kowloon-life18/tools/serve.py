#!/usr/bin/env python3
# ============================================================
# 開発用の静的サーバー (キャッシュ無効)
#
#   python tools/serve.py          → http://localhost:8000/
#   python tools/serve.py 8080     → ポート指定
#
# なぜこれが必要か:
#   python -m http.server は Cache-Control ヘッダを送らない。
#   ブラウザは Last-Modified からヒューリスティックに有効期限を決めて
#   再検証なしにキャッシュを使うため、js を書き換えても古い版が読まれ、
#   「ファイルは直っているのにブラウザだけ古い」という事故が起きる。
#
#   このサーバーは毎回 no-store を返すので、リロードすれば必ず最新になる。
#
# ゲーム本体には一切影響しない開発ツール。配布時は不要。
# ============================================================
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        # 404 と 5xx だけ出す (静かにしておく)
        status = args[1] if len(args) > 1 else ''
        if str(status).startswith(('4', '5')):
            super().log_message(fmt, *args)


class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    with ReusableServer(('', PORT), NoCacheHandler) as httpd:
        print(f'serving {ROOT}')
        print(f'  → http://localhost:{PORT}/              (九龍城ライフ18 本体)')
        print(f'  → http://localhost:{PORT}/site_test.html (敷地テスト)')
        print('  Cache-Control: no-store  — リロードすれば必ず最新が読まれます')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nstopped')
