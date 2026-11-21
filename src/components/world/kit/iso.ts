import * as THREE from "three";

/** The isometric camera every stage uses: orthographic, yaw 45 degrees, pitch 34. RV is screen-right on the ground,
 *  DV points from the scene toward the viewer on the ground, DIR toward the camera, UP is screen-up. */
export const Q = Math.PI / 4;
export const PITCH = (34 * Math.PI) / 180;
export const RV = new THREE.Vector3(1, 0, -1).normalize();
export const DV = new THREE.Vector3(1, 0, 1).normalize();
export const DIR = new THREE.Vector3(Math.sin(Q) * Math.cos(PITCH), Math.sin(PITCH), Math.cos(Q) * Math.cos(PITCH));
export const UP = new THREE.Vector3(-Math.sin(PITCH) * Math.sin(Q), Math.cos(PITCH), -Math.sin(PITCH) * Math.cos(Q));
export const NEAR = 1, FAR = 700;
/** Vertical size on screen of one world unit of height (cos pitch): stretch a picture's height by 1 / COS to show it flat. */
export const COS = Math.cos(PITCH);

export const isoCamera = () => new THREE.OrthographicCamera(-1, 1, 1, -1, NEAR, FAR);

/** Point the camera at `t`, framing at least `h` world units tall and `w` wide; returns the height it frames. */
export function aim(cam: THREE.OrthographicCamera, t: THREE.Vector3, h: number, w: number, aspect: number) {
  const vh = Math.max(h, w / aspect);
  cam.top = vh / 2;
  cam.bottom = -vh / 2;
  cam.left = (-vh * aspect) / 2;
  cam.right = (vh * aspect) / 2;
  cam.position.copy(t).addScaledVector(DIR, 300);
  cam.up.copy(UP);
  cam.lookAt(t);
  cam.updateProjectionMatrix();
  return vh;
}
