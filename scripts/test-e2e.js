const { spawnSync } = require('node:child_process');

function run(command) {
  const result = spawnSync(command, { stdio: 'inherit', shell: true });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const error = new Error(`Command failed: ${command}`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

let exitCode = 0;

try {
  run('docker compose --profile test up -d db_test');
  run('npx drizzle-kit migrate --config=drizzle.config.test.ts');
  run('jest');
} catch (error) {
  exitCode = error.exitCode || 1;
} finally {
  const cleanup = spawnSync('docker compose --profile test rm -sf db_test', {
    stdio: 'inherit',
    shell: true,
  });

  if (cleanup.error || cleanup.status !== 0) {
    console.error('Failed to remove test database container automatically.');

    if (exitCode === 0) {
      exitCode = 1;
    }
  }
}

process.exit(exitCode);
