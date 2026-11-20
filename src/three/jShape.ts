import * as THREE from "three";

/** The Mark's J: a heavy geometric J with a flat cap and a round hook, about 2 by 3, chamfered all round.
 *  A stand-in built in code until the modelled GLB (A1) exists. */
export function markGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0.1, 3.0);
  s.lineTo(1.66, 3.0);
  s.lineTo(1.66, 1.02);
  s.absarc(0.84, 1.02, 0.82, 0, Math.PI, true);
  s.lineTo(0.02, 1.4);
  s.lineTo(0.64, 1.4);
  s.lineTo(0.64, 1.02);
  s.absarc(0.84, 1.02, 0.2, Math.PI, Math.PI * 2, false);
  s.lineTo(1.04, 2.46);
  s.lineTo(0.1, 2.46);
  s.lineTo(0.1, 3.0);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.62,
    bevelEnabled: true,
    bevelThickness: 0.11,
    bevelSize: 0.09,
    bevelSegments: 1,
    curveSegments: 56,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}
