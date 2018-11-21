import * as THREE from 'three'

export default class Building {
  constructor() {
    const geometry = new THREE.BoxBufferGeometry(2, 20, 2)
    const material = new THREE.MeshPhongMaterial({
      color: 0x072b44,
      specular: 0x072b44,
      shininess: 60
    })
    this.mesh = new THREE.Mesh(geometry, material)
  }
}
