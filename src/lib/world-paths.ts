import * as topojson from "topojson-client";
import landTopo from "world-atlas/land-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";

// Projection bounds: crop to useful latitudes (skip poles)
const LAT_MIN = -56;
const LAT_MAX = 83;
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 380;

// Pre-compute the Mercator Y range for our lat bounds
const mercYMax = Math.log(Math.tan(Math.PI / 4 + (LAT_MAX * Math.PI) / 360));
const mercYMin = Math.log(Math.tan(Math.PI / 4 + (LAT_MIN * Math.PI) / 360));
const mercRange = mercYMax - mercYMin;

export function projectMercator(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * MAP_WIDTH;
  const clampedLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  // Map mercN from [mercYMin, mercYMax] to [MAP_HEIGHT, 0]
  const y = MAP_HEIGHT - ((mercN - mercYMin) / mercRange) * MAP_HEIGHT;
  return [x, y];
}

/**
 * Split a ring at each antimeridian crossing.
 * At each crossing, interpolate the lat at ±180° and start a new sub-ring.
 */
function splitAtAntimeridian(ring: number[][]): number[][][] {
  const segments: number[][][] = [];
  let current: number[][] = [];

  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];

    if (i > 0) {
      const prev = ring[i - 1];

      if (Math.abs(p[0] - prev[0]) > 180) {
        // Crossing detected — interpolate lat at the boundary
        // Figure out which direction we're crossing
        const prevLng = prev[0];
        const currLng = p[0];

        // Normalize the crossing: compute the actual angular distance
        let dLng: number;
        if (prevLng > 0 && currLng < 0) {
          // East to West crossing (e.g., 178 -> -180)
          dLng = (180 - prevLng) + (180 + currLng);
        } else {
          // West to East crossing (e.g., -180 -> 178)
          dLng = (180 + prevLng) + (180 - currLng);
        }

        const fraction = dLng > 0 ? (180 - Math.abs(prevLng)) / dLng : 0.5;
        const crossLat = prev[1] + fraction * (p[1] - prev[1]);

        // Close current segment at the edge
        const prevEdge = prevLng > 0 ? 180 : -180;
        current.push([prevEdge, crossLat]);
        if (current.length >= 3) segments.push(current);

        // Start new segment from the opposite edge
        const newEdge = prevLng > 0 ? -180 : 180;
        current = [[newEdge, crossLat]];
      }
    }

    current.push(p);
  }

  if (current.length >= 3) segments.push(current);
  return segments;
}

function coordsToPath(ring: number[][]): string {
  return ring
    .map((coord, i) => {
      const [x, y] = projectMercator(coord[0], coord[1]);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

function generateWorldPaths(): string[] {
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
  const land = topojson.feature(topo, topo.objects.land);

  const paths: string[] = [];

  function processRing(ring: number[][]) {
    if (ring.length < 4) return;

    // Skip Antarctica and other polar-only polygons
    const maxLat = Math.max(...ring.map((c) => c[1]));
    if (maxLat < -55) return;

    // Check if this ring crosses the antimeridian
    let crosses = false;
    for (let i = 1; i < ring.length; i++) {
      if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) {
        crosses = true;
        break;
      }
    }

    if (crosses) {
      const subRings = splitAtAntimeridian(ring);
      for (const sub of subRings) {
        if (sub.length >= 3) paths.push(coordsToPath(sub));
      }
    } else {
      paths.push(coordsToPath(ring));
    }
  }

  if (land.type === "FeatureCollection") {
    for (const feature of land.features) {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        if (geom.coordinates[0]) processRing(geom.coordinates[0]);
      } else if (geom.type === "MultiPolygon") {
        for (const polygon of geom.coordinates) {
          if (polygon[0]) processRing(polygon[0]);
        }
      }
    }
  }

  return paths;
}

export const WORLD_PATHS = generateWorldPaths();
