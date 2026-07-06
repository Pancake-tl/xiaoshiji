"""小事记管理后台 - 本地服务器 / GitHub Pages 兼容版"""
import http.server
import urllib.request
import json
import sys

API_URL = "https://cloud1-d7g8gwbn444bcac50-1450323372.ap-shanghai.app.tcloudbase.com/records"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class AdminProxy(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(__file__.replace(".py", ".html") if __file__.endswith(".py") else "index.html", "rb") as f:
                self.wfile.write(f.read())
        elif self.path.startswith("/api/"):
            self.handle_api("GET")
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path.startswith("/api/"):
            self.handle_api("POST")
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_cors_headers()
        self.end_headers()

    def handle_api(self, method):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len) if content_len > 0 else b""
        
        # 转发到 HTTP 网关
        req = urllib.request.Request(API_URL, data=body if method == "POST" else None,
            method=method,
            headers={"Content-Type": "application/json"})
        if method == "GET":
            qs = self.path.split("?", 1)[1] if "?" in self.path else ""
            req = urllib.request.Request(API_URL + "?" + qs, method="GET")
        
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                self.send_response(resp.status)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, fmt, *args):
        print(f"[{self.address_string()}] {fmt % args}", file=sys.stderr)

if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", PORT), AdminProxy)
    print(f"小事记管理后台: http://localhost:{PORT}")
    print(f"按 Ctrl+C 停止")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()