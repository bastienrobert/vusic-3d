import * as THREE from 'three'

export default class Lamp {
  constructor() {
    const geometry = new THREE.SphereBufferGeometry(0.25, 16, 8)
    const material = new THREE.MeshBasicMaterial({ color: 0xf0d499 })
    this.mesh = new THREE.Mesh(geometry, material)

    this.light = new THREE.PointLight(0xeadfc5, 0.5, 10)
    this.light.add(this.mesh)
    this.light.position.set(
      Math.random() * 50 - 25,
      15 + Math.random() * 5,
      Math.random() * 50 - 25
    )
  }
}
