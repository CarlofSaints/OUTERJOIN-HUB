import fs from 'fs';
import path from 'path';
import { put, get } from '@vercel/blob';

export interface Module {
  slug: string;
  name: string;
  description: string;
  url: string;
  color: string;
  icon: string;
  order: number;
  comingSoon: boolean;
}

const BLOB_KEY = 'modules.json';

/**
 * Load modules from Vercel Blob (production) or local file (dev).
 * NO module-level cache — multi-container serverless safety.
 */
export async function loadModules(): Promise<Module[]> {
  if (!process.env.VERCEL) {
    const localFile = path.join(process.cwd(), 'data', 'modules.json');
    try {
      if (fs.existsSync(localFile)) {
        return JSON.parse(fs.readFileSync(localFile, 'utf-8')) as Module[];
      }
    } catch { /* empty */ }
    return [];
  }

  try {
    const result = await get(BLOB_KEY, { access: 'private', useCache: false });
    if (result && result.statusCode === 200) {
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as Module[];
    }
  } catch (err) {
    console.error('[moduleData] Blob read failed:', err instanceof Error ? err.message : err);
  }
  return [];
}

export async function saveModules(modules: Module[]): Promise<void> {
  const json = JSON.stringify(modules, null, 2);

  try {
    await put(BLOB_KEY, json, {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
      addRandomSuffix: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to persist modules to Vercel Blob: ${msg}`);
  }

  // Local dev: also write to local file
  try {
    const localFile = path.join(process.cwd(), 'data', 'modules.json');
    const dir = path.dirname(localFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localFile, json);
  } catch {
    // Vercel read-only FS — expected
  }
}

/**
 * Default modules — seeded on first run.
 */
export const DEFAULT_MODULES: Module[] = [
  {
    slug: 'field-execute',
    name: 'Field Execute',
    description: 'Defy field execution reports and data processing',
    url: 'https://fieldexecute.outerjoin.co.za',
    color: '#E04E2A',
    icon: 'chart-bar',
    order: 1,
    comingSoon: false,
  },
  {
    slug: 'ao-dashboard',
    name: 'A&O Dashboard',
    description: 'A&O Interactive services dashboard and reporting',
    url: 'https://ao-dashboard-eta.vercel.app',
    color: '#E04E2A',
    icon: 'chart-line',
    order: 2,
    comingSoon: false,
  },
  {
    slug: 'aria-onboarding',
    name: 'ARIA Onboarding',
    description: 'Client onboarding workflow and checklist management',
    url: 'https://aria-onboarding-two.vercel.app',
    color: '#E04E2A',
    icon: 'clipboard',
    order: 3,
    comingSoon: false,
  },
  {
    slug: 'dischem-bi',
    name: 'Dis-Chem BI Manager',
    description: 'Dis-Chem business intelligence export management',
    url: 'https://dischem-bi-manager.vercel.app',
    color: '#E04E2A',
    icon: 'database',
    order: 4,
    comingSoon: false,
  },
  {
    slug: 'store-matcher',
    name: 'Store Matcher',
    description: 'Fuzzy store name matching across retail datasets',
    url: '',
    color: '#E04E2A',
    icon: 'search',
    order: 5,
    comingSoon: true,
  },
];
