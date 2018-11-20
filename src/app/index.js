import './styles.scss'
import 'reset-css'

import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'

import Building from 'components/Building'
import Lamp from 'components/Lamp'

import 'utils/OrbitControls'

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
    this.scene.background = new THREE.Color(0xffffff)
    // this.scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

    // Create camera and set default position
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 120, 0)
    this.camera.lookAt(new THREE.Vector3(0, 2, 0))

    // Create clock
    this.clock = new THREE.Clock()

    // Create ambient light
    // const ambientLight = new THREE.AmbientLight(0x2a627f)
    const ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(ambientLight)

    // Debug DirectionalLight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 10, 0)
    this.scene.add(directionalLight)

    // Create stats
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    // Create dat.gui
    this.gui = new dat.GUI()

    // Create OrbitControls and plug it to camera
    this.controls = new THREE.OrbitControls(this.camera)

    // Setup meshes
    this.createGround()
    this.createBuildings()
    this.createLights()

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  createGround() {
    // Create ground
    const ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: false })
    )
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)

    // Grid helper
    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
    grid.material.opacity = 0.2
    grid.material.transparent = true
    this.scene.add(grid)
  }

  createBuildings() {
    this.buildings = []
    this.lamps = []

    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        const random = Math.random()
        const x = i * 2 + i * 0.5 - 50
        const z = j * 2 + j * 0.5 - 50
        if (random < 0.95) {
          const building = new Building()
          building.mesh.position.set(x, 0, z)
          this.buildings.push(building)
          this.scene.add(building.mesh)
        } else {
          const lamp = new Lamp()
          lamp.mesh.position.set(x, Math.random() * 10, z)
          this.lamps.push(lamp)
          this.scene.add(lamp.mesh)
        }
      }
    }
  }

  createLights() {
    this.lights = []

    const sphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.25, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0xf0d499 })
    )

    for (let i = 0; i < 10; i++) {
      const light = new THREE.PointLight(0xeadfc5, 1, 50)
      light.add(sphere)
      light.position.set(
        Math.random() * 30,
        Math.random() * 15,
        Math.random() * 30
      )
      this.lights.push(light)
      this.scene.add(light)
    }
  }

  render() {
    const et = this.clock.getElapsedTime()
    this.controls.update()
    this.buildings.forEach((building, i) => {
      building.mesh.position.y = Math.abs(Math.sin(et + i / 100)) * 10
    })
    this.renderer.render(this.scene, this.camera)
    this.stats.update()
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
