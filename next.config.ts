import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  turbopack: {
    root: currentDir
  }
};

export default nextConfig;
