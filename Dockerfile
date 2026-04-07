FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY src/ src/
COPY bin/ bin/
COPY pirate-claw.config.example.json ./

RUN bun build src/cli.ts --outdir dist --target bun --format esm

ENTRYPOINT ["bun", "run", "dist/cli.js"]
CMD ["daemon"]
