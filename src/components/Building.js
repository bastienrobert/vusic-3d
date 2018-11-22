import * as THREE from 'three'

import metal from 'assets/metal/metal.jpg'
import occ from 'assets/metal/occ.jpg'
// import disp from 'assets/metal/disp.jpg'
import normal from 'assets/metal/normal.jpg'

export default class Building {
  constructor() {
    const geometry = new THREE.BoxBufferGeometry(2, 20, 2)
    const material = new THREE.MeshPhongMaterial({
      // color: 0x072b44,
      specular: 0xf0d499,
      map: new THREE.TextureLoader().load(metal),
      aoMap: new THREE.TextureLoader().load(occ), // displacementMap: new THREE.TextureLoader().load(disp),
      normalMap: new THREE.TextureLoader().load(normal),
      shininess: 50
    })
    this.mesh = new THREE.Mesh(geometry, material)
  }
}
