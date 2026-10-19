import { spawn } from "node:child_process";
import fs from "node:fs/promises";

const PORT = process.env.DEMO_PORT || "5174";
const BASE_URL = process.env.DEMO_URL || `http://localhost:${PORT}`;

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      const data = await res.json();
      return data.webSocketDebuggerUrl;
    } catch {
      await wait(250);
    }
  }
  throw new Error("Could not connect to Chrome debugger on port 9222");
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }
}

async function main() {
  const tmpDir = `/tmp/chrome-shot-${Date.now()}`;
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "--no-first-run",
    `--user-data-dir=${tmpDir}`,
  ]);

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise((r) => (ws.onopen = r));
    const cdp = new CdpClient(ws);

    const { targetId } = await cdp.send("Target.createTarget", {
      url: "about:blank",
    });
    const { sessionId } = await cdp.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });

    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: 1278,
        height: 637,
        deviceScaleFactor: 2,
        mobile: false,
      },
      sessionId,
    );

    await cdp.send(
      "Emulation.setEmulatedMedia",
      {
        media: "screen",
        features: [{ name: "prefers-color-scheme", value: "light" }],
      },
      sessionId,
    );

    await cdp.send("Page.enable", {}, sessionId);

    await fs.mkdir("examples/demo/screenshots", { recursive: true });

    const scenes = [
      {
        url: `${BASE_URL}/?scene=empty`,
        outputs: [
          ".github/assets/anter-ai-1.png",
          "examples/demo/screenshots/anter-ai-1.png",
          "examples/demo/screenshots/scene-empty.png",
        ],
      },
      {
        url: `${BASE_URL}/?scene=sources`,
        outputs: [
          ".github/assets/anter-ai-2.png",
          "examples/demo/screenshots/anter-ai-2.png",
          "examples/demo/screenshots/scene-sources.png",
        ],
      },
      {
        url: `${BASE_URL}/?scene=artifact`,
        outputs: [
          ".github/assets/anter-ai-3.png",
          "examples/demo/screenshots/anter-ai-3.png",
          "examples/demo/screenshots/scene-artifact.png",
        ],
        clickArtifact: true,
      },
      {
        url: `${BASE_URL}/?scene=approval`,
        outputs: ["examples/demo/screenshots/scene-approval.png"],
      },
    ];

    for (const scene of scenes) {
      console.log(`Navigating to ${scene.url}...`);
      await cdp.send("Page.navigate", { url: scene.url }, sessionId);
      await wait(1500);

      if (scene.clickArtifact) {
        console.log("Clicking artifact chip...");
        await cdp.send(
          "Runtime.evaluate",
          {
            expression: `(() => {
              const chip = document.querySelector('.ais-artifact-chip') || document.querySelector('button.ais-artifact-chip');
              if (chip) chip.click();
              return Boolean(chip);
            })()`,
            returnByValue: true,
          },
          sessionId,
        );
        await wait(1000);
      }

      console.log(`Capturing screenshot for ${scene.outputs[0]}...`);
      const { data } = await cdp.send("Page.captureScreenshot", { format: "png" }, sessionId);
      const buffer = Buffer.from(data, "base64");
      for (const out of scene.outputs) {
        await fs.writeFile(out, buffer);
        console.log(`Saved ${out} (${buffer.length} bytes)`);
      }
    }

    ws.close();
  } finally {
    chrome.kill("SIGKILL");
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
