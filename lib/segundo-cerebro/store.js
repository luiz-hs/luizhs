// Armazena as notas como arquivos .md com frontmatter — um "vault"
// compatível com Obsidian por baixo da interface web. Cada empresa tem
// sua própria pasta; cada nota é um arquivo dentro da pasta da área.
//
// Isso persiste em disco: funciona para rodar local ou num servidor com
// disco persistente. Numa serverless (Vercel), o sistema de arquivos não
// persiste entre deploys — para produção multi-cliente, trocar por
// Postgres/Supabase mantendo o mesmo formato de nota.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { AREA_BY_ID } from './areas';

const ROOT = path.join(process.cwd(), 'data', 'segundo-cerebro');

function safeSlug(id) {
  return String(id || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function areaDir(empresaId, area) {
  return path.join(ROOT, safeSlug(empresaId), area);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function listNotes(empresaId, area) {
  if (!AREA_BY_ID[area]) return [];
  const dir = areaDir(empresaId, area);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        id: file.replace(/\.md$/, ''),
        area,
        title: data.title || '(sem título)',
        tags: data.tags || [],
        createdAt: data.createdAt || null,
        content: content.trim(),
      };
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function listAllNotes(empresaId) {
  return Object.keys(AREA_BY_ID).flatMap((area) => listNotes(empresaId, area));
}

// structured: { title, summary, tags } — já processado pela IA (ou fallback)
export function createNote(empresaId, area, rawText, structured) {
  if (!AREA_BY_ID[area]) throw new Error(`Área inválida: ${area}`);
  const dir = areaDir(empresaId, area);
  ensureDir(dir);

  const createdAt = new Date().toISOString();
  const id = `${createdAt.replace(/[:.]/g, '-')}-${safeSlug(structured.title) || 'nota'}`;
  const body = [
    structured.summary || rawText,
    '',
    '## Nota original',
    '',
    rawText,
  ].join('\n');

  const file = matter.stringify(body, {
    title: structured.title,
    area,
    tags: structured.tags || [],
    createdAt,
  });

  fs.writeFileSync(path.join(dir, `${id}.md`), file, 'utf8');

  return { id, area, title: structured.title, tags: structured.tags || [], createdAt, content: body.trim() };
}

export function deleteNote(empresaId, area, id) {
  if (!AREA_BY_ID[area]) return false;
  const file = path.join(areaDir(empresaId, area), `${path.basename(String(id))}.md`);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
