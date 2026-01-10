#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Derive project name from package.json
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
process.env.PROJECT_NAME = pkg.name;

// Import after setting PROJECT_NAME
const { allocate } = await import('port-registry/port-client');

const port = await allocate();
console.log(`[dev-server] Allocated port ${port} for ${pkg.name}`);

// Spawn next dev with allocated port
const next = spawn('npx', ['next', 'dev', '-p', String(port)], {
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
});

// Forward signals for clean shutdown
const shutdown = (signal) => {
  console.log(`\n[dev-server] Received ${signal}, shutting down...`);
  next.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

next.on('close', (code) => {
  process.exit(code ?? 0);
});
