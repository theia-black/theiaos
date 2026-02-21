/**
 * Dashboard — Built-in real-time command center
 * Serves HTML at /dashboard/* with WebSocket data aggregation at /dashboard/ws
 */
import fs from "node:fs";
import { type IncomingMessage, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import os from "node:os";
import path from "node:path";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";

const DASHBOARD_PREFIX = "/dashboard";
const DASHBOARD_WS_PATH = "/dashboard/ws";
const MAX_FEED = 200;
const MAX_SEEN = 1000;

export type DashboardConfig = {
  brainUrl?: string;
  brainToken?: string;
};

export type DashboardHandler = {
  handleHttpRequest(req: IncomingMessage, res: ServerResponse): boolean;
  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): boolean;
  close(): Promise<void>;
};

function resolveAssetsDir(): string {
  const fromDist = path.resolve(new URL(".", import.meta.url).pathname, "../assets/dashboard");
  if (fs.existsSync(fromDist)) {
    return fromDist;
  }
  const fromCwd = path.resolve(process.cwd(), "assets/dashboard");
  if (fs.existsSync(fromCwd)) {
    return fromCwd;
  }
  return fromDist;
}

async function safeFetch(url: string, headers?: Record<string, string>): Promise<unknown> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), headers });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

function systemStats() {
  const cpus = os.cpus();
  const cpuAvg =
    cpus.reduce((sum, c) => {
      const total = Object.values(c.times).reduce((a, b) => a + b, 0);
      return sum + (1 - c.times.idle / total);
    }, 0) / cpus.length;
  return {
    cpuPercent: Math.round(cpuAvg * 100),
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || "unknown",
    memTotal: os.totalmem(),
    memFree: os.freemem(),
    memUsedPercent: Math.round((1 - os.freemem() / os.totalmem()) * 100),
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    hostname: os.hostname(),
    platform: os.platform(),
  };
}

export function isDashboardPath(pathname: string): boolean {
  return pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`);
}

export function isDashboardWsPath(pathname: string): boolean {
  return pathname === DASHBOARD_WS_PATH;
}

export function createDashboardHandler(config?: DashboardConfig): DashboardHandler {
  const assetsDir = resolveAssetsDir();
  const brainUrl = config?.brainUrl || "";
  const brainToken = config?.brainToken || "";
  const brainHeaders: Record<string, string> = brainToken ? { "X-Brain-Token": brainToken } : {};

  const wss = new WebSocketServer({ noServer: true });
  const clients = new Set<WebSocket>();
  const feedCache: Array<Record<string, unknown>> = [];
  const seenIds = new Set<string>();
  const intervals: NodeJS.Timeout[] = [];

  function broadcast(type: string, data: unknown) {
    const msg = JSON.stringify({ type, data, ts: Date.now() });
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(msg);
      }
    }
  }

  // Only start brain polling if brainUrl is configured
  if (brainUrl) {
    // System stats — every 5s
    intervals.push(
      setInterval(() => {
        broadcast("services", { services: [], system: systemStats() });
      }, 5000),
    );

    // Brain state — every 3s
    intervals.push(
      setInterval(async () => {
        const state = await safeFetch(`${brainUrl}/brain/state`, brainHeaders);
        if (state) {
          broadcast("brain", state);
        }
      }, 3000),
    );

    // Neural metrics — every 3s
    intervals.push(
      setInterval(async () => {
        const metrics = await safeFetch(`${brainUrl}/neural/metrics`, brainHeaders);
        if (metrics) {
          broadcast("neural", metrics);
        }
      }, 3000),
    );

    // Total recall — every 10s
    intervals.push(
      setInterval(async () => {
        const stats = await safeFetch(`${brainUrl}/total-recall/stats`, brainHeaders);
        if (stats) {
          broadcast("recall", stats);
        }
      }, 10000),
    );

    // Cloud brain stats — every 8s
    intervals.push(
      setInterval(async () => {
        const stats = await safeFetch(`${brainUrl}/brain/stats`, brainHeaders);
        if (stats) {
          broadcast("cloud-brain", stats);
        }
      }, 8000),
    );

    // Brain feed — every 3s
    const NOISE_RE =
      /^(\[.*moved|lane |run (registered|cleared)|embedded run|heartbeat|HEARTBEAT_OK|NO_REPLY|diagnostic)/i;
    intervals.push(
      setInterval(async () => {
        const ctx = (await safeFetch(
          `${brainUrl}/brain/context?channel=dashboard&limit=50`,
          brainHeaders,
        )) as { raw?: Array<Record<string, string>> } | null;
        if (!ctx?.raw) {
          return;
        }
        for (const m of ctx.raw) {
          const id = m.created_at || `${m.speaker}:${(m.content || "").slice(0, 60)}`;
          if (seenIds.has(id)) {
            continue;
          }
          seenIds.add(id);
          if (seenIds.size > MAX_SEEN) {
            const arr = [...seenIds];
            seenIds.clear();
            for (const x of arr.slice(-MAX_SEEN / 2)) {
              seenIds.add(x);
            }
          }
          if (NOISE_RE.test(m.content || "")) {
            continue;
          }
          if (m.speaker === "system") {
            continue;
          }
          const feedMsg = {
            speaker: m.speaker || "unknown",
            text: m.content || "",
            channel: m.channel || "unknown",
            ts: m.created_at || new Date().toISOString(),
          };
          broadcast("feed", feedMsg);
          feedCache.push(feedMsg);
          if (feedCache.length > MAX_FEED) {
            feedCache.shift();
          }
        }
      }, 3000),
    );
  } else {
    // No brain URL — just broadcast system stats
    intervals.push(
      setInterval(() => {
        broadcast("services", { services: [], system: systemStats() });
      }, 5000),
    );
  }

  // WebSocket connection handling
  wss.on("connection", async (ws: WebSocket) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));

    // Send initial state
    ws.send(
      JSON.stringify({
        type: "services",
        data: { services: [], system: systemStats() },
        ts: Date.now(),
      }),
    );

    if (brainUrl) {
      const [brain, neural, recall] = await Promise.all([
        safeFetch(`${brainUrl}/brain/state`, brainHeaders),
        safeFetch(`${brainUrl}/neural/metrics`, brainHeaders),
        safeFetch(`${brainUrl}/total-recall/stats`, brainHeaders),
      ]);
      if (brain) {
        ws.send(JSON.stringify({ type: "brain", data: brain, ts: Date.now() }));
      }
      if (neural) {
        ws.send(JSON.stringify({ type: "neural", data: neural, ts: Date.now() }));
      }
      if (recall) {
        ws.send(JSON.stringify({ type: "recall", data: recall, ts: Date.now() }));
      }
    }

    // Send cached feed
    for (const fm of feedCache) {
      ws.send(JSON.stringify({ type: "feed", data: fm }));
    }

    // Handle commands
    ws.on("message", (raw: Buffer | string) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === "command" && msg.text) {
          ws.send(JSON.stringify({ type: "command-ack", data: { sent: true } }));
        }
      } catch {
        // ignore
      }
    });
  });

  // Route map for HTML pages
  const pages: Record<string, string> = {
    "": "index.html",
    "/": "index.html",
    "/mission-control": "mission-control.html",
    "/fry-room": "fry-room.html",
  };

  const handleHttpRequest = (req: IncomingMessage, res: ServerResponse): boolean => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname;

    if (!pathname.startsWith(DASHBOARD_PREFIX)) {
      return false;
    }

    if (pathname === DASHBOARD_WS_PATH) {
      res.statusCode = 426;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Upgrade Required");
      return true;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Method Not Allowed");
      return true;
    }

    // Health API
    if (pathname === `${DASHBOARD_PREFIX}/api/health`) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
      return true;
    }

    // Redirect /dashboard to /dashboard/
    if (pathname === DASHBOARD_PREFIX) {
      res.statusCode = 302;
      res.setHeader("Location", `${DASHBOARD_PREFIX}/${url.search}`);
      res.end();
      return true;
    }

    // Resolve page
    const subPath = pathname.slice(DASHBOARD_PREFIX.length);
    const filename = pages[subPath] || pages[subPath.replace(/\/$/, "")];

    if (!filename) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Not Found");
      return true;
    }

    const filePath = path.join(assetsDir, filename);
    if (!fs.existsSync(filePath)) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(`Dashboard assets not found at ${assetsDir}`);
      return true;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(fs.readFileSync(filePath, "utf8"));
    return true;
  };

  const handleUpgrade = (req: IncomingMessage, socket: Duplex, head: Buffer): boolean => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== DASHBOARD_WS_PATH) {
      return false;
    }
    wss.handleUpgrade(req, socket as Socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
    return true;
  };

  const close = async (): Promise<void> => {
    for (const interval of intervals) {
      clearInterval(interval);
    }
    intervals.length = 0;
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  };

  return { handleHttpRequest, handleUpgrade, close };
}
