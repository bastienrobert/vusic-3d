import './styles.scss'
import 'reset-css'

import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'

import OrbitControls from 'utils/OrbitControls'

import Mesh from 'components/Mesh'

export default class App {
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'app'
    document.body.appendChild(this.container)

    this.init()
  }

  init() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)

    // Create scene
    this.scene = new THREE.Scene()

    // Create camera and set default position
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      20
    )
    this.camera.position.z = 1

    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0x2a627f)
    // const ambientLight = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambientLight)

    // Debug DirectionalLight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(-10, 10, 0)
    this.scene.add(directionalLight)

    // Create stats
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    // Create dat.gui
    this.gui = new dat.GUI()

    // Create OrbitControls and plug it to camera
    this.controls = new OrbitControls(this.camera)

    // Bullshit
    const obj = new Mesh()
    this.mesh = obj.mesh
    this.scene.add(this.mesh)
    // End of bullshit

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  render() {
    this.stats.begin()
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.stats.end()
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
