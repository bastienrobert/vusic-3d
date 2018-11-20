import './styles.scss'
import 'reset-css'

import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import RobotExpressive from 'assets/RobotExpressive.glb'

import 'utils/OrbitControls'
import 'utils/GLTFLoader'

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
    this.scene.background = new THREE.Color(0xe0e0e0)
    this.scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

    // Create camera and set default position
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(-5, 3, 10)
    this.camera.lookAt(new THREE.Vector3(0, 2, 0))

    // Create clock
    this.clock = new THREE.Clock()

    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0x2a627f)
    // const ambientLight = new THREE.AmbientLight(0xffffff)
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
    this.createCharacter()

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  createCharacter() {
    const loader = new THREE.GLTFLoader()
    loader.load(
      RobotExpressive,
      gltf => {
        this.model = gltf.scene
        this.scene.add(this.model)
        this.createGUI(gltf.animations)
      },
      undefined,
      function(e) {
        console.error(e)
      }
    )
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

  createGUI(animations) {
    console.log(animations)
    this.mixer = new THREE.AnimationMixer(this.model)
    const clip = animations[0]
    const action = this.mixer.clipAction(clip)
    action.play()
  }

  render() {
    const dt = this.clock.getDelta()
    if (this.mixer) this.mixer.update(dt)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.stats.update()
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
