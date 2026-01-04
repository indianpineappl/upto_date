import ngeohash from 'ngeohash';

export const GEOHASH_PRECISION = 5;

export function toBucketId(lat: number, lng: number, precision: number = GEOHASH_PRECISION) {
  const hash = ngeohash.encode(lat, lng, precision);
  return `gh${precision}:${hash}`;
}

export function bucketFallbackChain(lat: number, lng: number) {
  const chain: string[] = [];

  for (let p = GEOHASH_PRECISION; p >= 2; p -= 1) {
    chain.push(toBucketId(lat, lng, p));
  }

  chain.push('global');
  return chain;
}

export function bucketIdToApproxCoords(bucketId: string): { latitude: number; longitude: number } | null {
  const match = /^gh(\d+):([a-z0-9]+)$/i.exec(bucketId);
  if (!match) return null;

  const hash = match[2];
  try {
    const decoded = ngeohash.decode(hash);
    return { latitude: decoded.latitude, longitude: decoded.longitude };
  } catch (_e) {
    return null;
  }
}
