import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const processes = [
  spawn(process.execPath, ["apps/web/node_modules/vite/bin/vite.js", "apps/web", "--host", "127.0.0.1"], {
    cwd: root,
    stdio: "inherit"
  }),
  spawn(process.execPath, ["apps/api/node_modules/tsx/dist/cli.mjs", "apps/api/src/server.ts"], {
    cwd: root,
    stdio: "inherit"
  })
];

const stop = () => {
  for (const child of processes) child.kill();
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stop();
      process.exitCode = code;
    }
  });
}
