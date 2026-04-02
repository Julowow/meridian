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

  if (land.type === "FeatureCollection") {
    for (const feature of land.features) {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        for (const ring of geom.coordinates) {
          paths.push(coordsToPath(ring));
        }
      } else if (geom.type === "MultiPolygon") {
        for (const polygon of geom.coordinates) {
          for (const ring of polygon) {
            paths.push(coordsToPath(ring));
          }
        }
      }
    }
  }

  return paths;
}

export const WORLD_PATHS = generateWorldPaths();
