import * as THREE from 'three'

export default class Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const material = new THREE.MeshNormalMaterial()
    this.mesh = new THREE.Mesh(geometry, material)
  }
}
