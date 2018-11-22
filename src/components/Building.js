import * as THREE from 'three'

import metal from 'assets/metal/metal.jpg'
import metalOcc from 'assets/metal/occ.jpg'

import paper from 'assets/paper/paper.jpg'
import paperOcc from 'assets/paper/occ.jpg'

export default class Building {
  static black() {
    return new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(metal),
      aoMap: new THREE.TextureLoader().load(metalOcc),
      specular: 0xf0d499,
      shininess: 50
    })
  }

  static white() {
    return new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(paper),
      aoMap: new THREE.TextureLoader().load(paperOcc),
      specular: 0xf0d499,
      shininess: 50
    })
  }

  constructor() {
    const geometry = new THREE.BoxBufferGeometry(2, 20, 2)
    const material = Building.black()
    this.mesh = new THREE.Mesh(geometry, material)
  }
}
