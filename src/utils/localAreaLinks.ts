// src/utils/localAreaLinks.ts
// 25 Dynamic Internal Footer links per city = 13 service areas + 12 nearby towns.
//   • 13 localities  : src/data/service-areas/all-100-cities.json  (same data <ServiceAreas> uses)
//   • 12 nearby towns: src/data/service-areas/also-serving-nearby-towns.json (same data as
//                      the "Also Serving Nearby Cities" section)
// Cities whose vetted data has too few distinct names are topped up from
// local-footer.json (supplement) so every city reaches 25 (100 × 25 = 2,500).
import allAreas from '../data/service-areas/all-100-cities.json';
import nearbyData from '../data/service-areas/also-serving-nearby-towns.json';
import localFooter from '../data/service-areas/local-footer.json';
import { resolveServiceAreaSlug } from './serviceAreaSlug';

export const AREAS_SHOWN = 13;
export const TOWNS_SHOWN = 12;
export const FOOTER_TOTAL = AREAS_SHOWN + TOWNS_SHOWN; // 25

export type AreaCategory = 'affluent' | 'commercial' | 'high-population';
export interface LocalLink {
  name: string;               // anchor / display name
  slug: string;               // url slug, unique within the city
  href: string;               // /state/city/slug/
  kind: 'area' | 'town';
  category?: AreaCategory;    // only for vetted localities
}
export interface FooterLinks {
  areas: LocalLink[];  // up to 13 — also what <ServiceAreas> displays
  towns: LocalLink[];  // up to 12
  extra: LocalLink[];  // top-up (only when areas/towns lost names to de-duplication)
  all: LocalLink[];    // areas + extra + towns (target 25)
}
interface CityLike { slug: string; name: string; state: string; }
interface RawArea { name: string; category?: AreaCategory }

const vettedBySlug = new Map<string, RawArea[]>();
for (const st of (allAreas as any).states) {
  for (const c of st.cities) vettedBySlug.set(c.slug, c.areas as RawArea[]);
}
const nearby: Record<string, string[]> = (nearbyData as any).cities ?? {};
const extraNames: Record<string, string[]> = (localFooter as any).supplement ?? {};

const slugify = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const cleanName = (name: string, city: string) =>
  name.replace(new RegExp(`,\\s*${city}\\s*$`, 'i'), '').trim();
const dedupeKey = (s: string) =>
  slugify(s).replace(/-(junction|extension)$/, '').replace(/-/g, '').replace(/th/g, 't')
    .replace(/pet(a)?$/, 'pet').replace(/a$/, '');

const cache = new Map<string, FooterLinks>();

export function getFooterLinks(city: CityLike): FooterLinks {
  const hit = cache.get(city.slug);
  if (hit) return hit;

  const pool: RawArea[] = [
    ...(vettedBySlug.get(resolveServiceAreaSlug(city.slug)) ?? []),
    ...(extraNames[city.slug] ?? []).map((name) => ({ name })),
  ];
  const towns: RawArea[] = (nearby[city.slug] ?? []).map((name) => ({ name }));

  const seenKeys = new Set<string>();
  const seenSlugs = new Set<string>();
  const take = (src: RawArea[], limit: number, kind: LocalLink['kind']): LocalLink[] => {
    const out: LocalLink[] = [];
    for (const a of src) {
      if (out.length >= limit) break;
      const name = cleanName(a.name, city.name);
      const slug = slugify(name);
      const key = dedupeKey(name);
      if (!slug || seenKeys.has(key) || seenSlugs.has(slug)) continue;
      seenKeys.add(key); seenSlugs.add(slug);
      out.push({ name, slug, kind, category: a.category, href: `/${city.state}/${city.slug}/${slug}/` });
    }
    return out;
  };

  const areas = take(pool, AREAS_SHOWN, 'area');
  const townLinks = take(towns, TOWNS_SHOWN, 'town');
  const missing = FOOTER_TOTAL - areas.length - townLinks.length;
  const extra = missing > 0 ? take(pool, missing, 'area') : [];

  const result: FooterLinks = { areas, towns: townLinks, extra, all: [...areas, ...extra, ...townLinks] };
  cache.set(city.slug, result);
  return result;
}
