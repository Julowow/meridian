import * as topojson from "topojson-client";
import landTopo from "world-atlas/land-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";

const WIDTH = 800;
const HEIGHT = 420;

function projectMercator(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * WIDTH;
  const latRad = (Math.max(-80, Math.min(84, lat)) * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = HEIGHT / 2 - (mercN / Math.PI) * (HEIGHT / 2);
  return [x, y];
}

/**
 * Check if a polygon ring crosses the antimeridian (180° longitude).
 * Detected when consecutive points have a longitude jump > 180°.
 */
function crossesAntimeridian(ring: number[][]): boolean {
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
  }
  return false;
}

/**
 * Split a ring that crosses the antimeridian into two halves:
 * one for the western side and one for the eastern side.
 */
function splitAtAntimeridian(ring: number[][]): number[][][] {
  const west: number[][] = [];
  const east: number[][] = [];

  for (const coord of ring) {
    if (coord[0] < 0) {
      west.push(coord);
    } else {
      east.push(coord);
    }
  }

  const result: number[][][] = [];
  if (west.length > 2) result.push(west);
  if (east.length > 2) result.push(east);
  return result;
}

function coordsToPath(ring: number[][]): string {
  return ring
    .map((coord, i) => {
      const [x, y] = projectMercator(coord[0], coord[1]);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

function generateWorldPaths(): string {
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
  const land = topojson.feature(topo, topo.objects.land);

  const allParts: string[] = [];

  function processRing(ring: number[][], isHole: boolean) {
    if (crossesAntimeridian(ring)) {
      // Split into two halves to avoid the horizontal line artifact
      const halves = splitAtAntimeridian(ring);
      for (const half of halves) {
        if (!isHole) {
          allParts.push(coordsToPath(half));
        }
      }
    } else {
      allParts.push(coordsToPath(ring));
    }
  }

  if (land.type === "FeatureCollection") {
    for (const feature of land.features) {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        geom.coordinates.forEach((ring, i) => processRing(ring, i > 0));
      } else if (geom.type === "MultiPolygon") {
        for (const polygon of geom.coordinates) {
          polygon.forEach((ring, i) => processRing(ring, i > 0));
        }
      }
    }
  }

  // Combine all paths into one single path string (avoids seams between polygons)
  return allParts.join(" ");
}

// Single combined SVG path for the entire world map
export const WORLD_PATH = generateWorldPaths();
