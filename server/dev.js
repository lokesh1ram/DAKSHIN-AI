import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = spawn(process.execPath, ["server/index.js"], {
  cwd: projectRoot,
  stdio: "inherit",
});
let frontend;
let shuttingDown = false;

function stopProcesses() {
  if (shuttingDown) return;
  shuttingDown = true;
  backend.kill();
  frontend?.kill();
}

process.on("SIGINT", stopProcesses);
process.on("SIGTERM", stopProcesses);

try {
  let backendReady = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (backend.exitCode !== null) {
      throw new Error("Backend exited before it became ready.");
    }
    try {
      const response = await fetch("http://localhost:5000/api/health");
      if (response.ok) {
        backendReady = true;
        break;
      }
    } catch {
      await delay(500);
    }
  }
  if (!backendReady) throw new Error("Backend did not become ready on port 5000.");

  frontend = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules", "vite", "bin", "vite.js")],
    { cwd: projectRoot, stdio: "inherit" }
  );
  frontend.on("error", (error) => {
    console.error("Could not start the Vite frontend:", error);
    process.exitCode = 1;
    stopProcesses();
  });
  frontend.on("exit", (code) => {
    if (!shuttingDown) {
      process.exitCode = code ?? 1;
      stopProcesses();
    }
  });
  backend.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`Backend stopped unexpectedly (exit code ${code ?? "unknown"}).`);
      process.exitCode = code ?? 1;
      stopProcesses();
    }
  });
} catch (error) {
  console.error("Could not start ActiveLife development services:", error.message);
  process.exitCode = 1;
  stopProcesses();
}
