import './styles.scss'
import 'reset-css'

import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'

import Mesh from 'components/Mesh'

export default class App {
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'app'
    document.body.appendChild(this.container)

    this.init()
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      10
    )
    this.camera.position.z = 1

    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.gui = new dat.GUI()

    this.scene = new THREE.Scene()

    const obj = new Mesh()
    this.mesh = obj.mesh
    this.scene.add(this.mesh)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()

    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  render() {
    this.mesh.rotation.x += 0.01
    this.mesh.rotation.y += 0.02

    this.renderer.render(this.scene, this.camera)
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
