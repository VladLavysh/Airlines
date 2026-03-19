const { spawnSync } = require('node:child_process');
const net = require('node:net');
const { config: dotenvConfig } = require('dotenv');

dotenvConfig({ path: '.env.test', override: false });

const defaultEnv = {
  NODE_ENV: 'test',
  SERVER_CORS_ORIGIN: 'http://localhost:3000',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5433',
  DATABASE_USER: 'postgres',
  DATABASE_PASSWORD: 'postgres',
  DATABASE_NAME: 'airlines_test',
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5433/airlines_test',
  POSTGRES_DB: 'airlines_test',
  POSTGRES_USER: 'postgres',
  POSTGRES_PASSWORD: 'postgres',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6380',
};

for (const [key, value] of Object.entries(defaultEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

function run(command) {
  const result = spawnSync(command, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const error = new Error(`Command failed: ${command}`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

function wait(waitMs) {
  return new Promise((resolve) => setTimeout(resolve, waitMs));
}

function canConnect(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    socket.setTimeout(1500);

    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });

    const onFailure = () => {
      socket.destroy();
      resolve(false);
    };

    socket.once('error', onFailure);
    socket.once('timeout', onFailure);
  });
}

async function waitForService(name, host, port, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await canConnect(host, port)) {
      return;
    }

    await wait(1_000);
  }

  throw new Error(`${name} did not become reachable at ${host}:${port} in time`);
}

async function main() {
  let exitCode = 0;

  try {
    run('docker compose -f ../docker-compose.yml --profile test up -d db_test redis_test');

    await waitForService(
      'Postgres',
      process.env.DATABASE_HOST,
      Number(process.env.DATABASE_PORT),
    );
    await waitForService(
      'Redis',
      process.env.REDIS_HOST,
      Number(process.env.REDIS_PORT),
    );

    run('npx drizzle-kit migrate --config=drizzle.config.test.ts');
    run(
      'npx jest --testRegex=".*\\.e2e-spec\\.ts$" --testPathIgnorePatterns="/node_modules/"',
    );
  } catch (error) {
    exitCode = error.exitCode || 1;
  } finally {
    const cleanup = spawnSync(
      'docker compose -f ../docker-compose.yml --profile test rm -sf db_test redis_test',
      {
        stdio: 'inherit',
        shell: true,
      },
    );

    if (cleanup.error || cleanup.status !== 0) {
      console.error('Failed to remove test containers automatically.');

      if (exitCode === 0) {
        exitCode = 1;
      }
    }

    process.exit(exitCode);
  }
}

main();
