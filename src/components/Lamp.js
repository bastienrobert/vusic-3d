import * as THREE from 'three'

export default class Lamp {
  constructor() {
    this.geometry = new THREE.BoxBufferGeometry(2, 20, 2)
    this.material = new THREE.MeshPhongMaterial({
      color: 0xaaf5f9,
      specular: 0xaaf5f9
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }
}
