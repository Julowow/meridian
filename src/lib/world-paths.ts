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
 */
function crossesAntimeridian(ring: number[][]): boolean {
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
  }
  return false;
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
    // Skip polygons that cross the antimeridian — they create artifacts
    if (crossesAntimeridian(ring)) return;
    // Skip tiny rings (< 4 points)
    if (ring.length < 4) return;
    paths.push(coordsToPath(ring));
  }

  if (land.type === "FeatureCollection") {
    for (const feature of land.features) {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        // Only process outer ring (index 0), skip holes
        if (geom.coordinates[0]) processRing(geom.coordinates[0]);
      } else if (geom.type === "MultiPolygon") {
        for (const polygon of geom.coordinates) {
          // Only process outer ring of each polygon
          if (polygon[0]) processRing(polygon[0]);
        }
      }
    }
  }

  return paths;
}

// Array of individual SVG path strings — each rendered as its own element
export const WORLD_PATHS = generateWorldPaths();
