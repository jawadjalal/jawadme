import * as THREE from "three";

/** Where flames stand in a still frame, for a poster's CSS flames (./Flames): each flame's base point and height as
 *  fractions of the frame, [x, y, h], for the flames on screen and tall enough to read. */
export function marks(camera: THREE.Camera, list: { p: THREE.Vector3; h: number }[]) {
  camera.updateMatrixWorld();
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const f = (n: number) => Math.round(n * 1e4) / 1e4;
  return list.flatMap(({ p, h }) => {
    a.copy(p).project(camera);
    b.copy(p).setY(p.y + h).project(camera);
    const x = (a.x + 1) / 2, y = (1 - a.y) / 2, s = (b.y - a.y) / 2;
    return x > -0.02 && x < 1.02 && y > 0.02 && y < 1.08 && s > 0.008 ? [[f(x), f(y), f(s)]] : [];
  });
}
