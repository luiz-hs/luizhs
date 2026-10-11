// Armazenamento dos casais.
// - Padrão: arquivo JSON em data/entrenos.json (rodar local ou em servidor Node com disco).
// - Se KV_REST_API_URL e KV_REST_API_TOKEN existirem: Upstash Redis / Vercel KV via REST.
import fs from 'fs';
import path from 'path';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const FILE = process.env.ENTRENOS_DATA_FILE || path.join(process.cwd(), 'data', 'entrenos.json');

// Serializa as operações de escrita dentro do processo para evitar perda de atualizações.
let queue = Promise.resolve();
function exclusive(fn) {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

// ---------- Arquivo ----------

function readFile() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return { couples: {}, codes: {} };
    throw err;
  }
}

function writeFile(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, FILE);
}

const fileStore = {
  async get(id) {
    return readFile().couples[id] || null;
  },
  async idForCode(code) {
    return readFile().codes[code] || null;
  },
  async save(doc) {
    const data = readFile();
    data.couples[doc.id] = doc;
    data.codes[doc.code] = doc.id;
    writeFile(data);
  },
};

// ---------- Upstash / Vercel KV ----------

async function kv(command) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`KV ${command[0]} falhou: ${res.status}`);
  return (await res.json()).result;
}

const kvStore = {
  async get(id) {
    const raw = await kv(['GET', `entrenos:couple:${id}`]);
    return raw ? JSON.parse(raw) : null;
  },
  async idForCode(code) {
    return kv(['GET', `entrenos:code:${code}`]);
  },
  async save(doc) {
    await kv(['SET', `entrenos:couple:${doc.id}`, JSON.stringify(doc)]);
    await kv(['SET', `entrenos:code:${doc.code}`, doc.id]);
  },
};

const backend = KV_URL && KV_TOKEN ? kvStore : fileStore;

export const store = {
  get: (id) => backend.get(id),
  idForCode: (code) => backend.idForCode(code),
  // Lê o casal, aplica a alteração e salva, tudo de forma exclusiva.
  update: (id, mutate) =>
    exclusive(async () => {
      const doc = await backend.get(id);
      const result = await mutate(doc);
      if (doc) await backend.save(doc);
      return result;
    }),
  create: (doc) => exclusive(() => backend.save(doc)),
};
