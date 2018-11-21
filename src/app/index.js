import './styles.scss'
import 'reset-css'

import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import SimplexNoise from 'simplex-noise'

import music from 'assets/Flamingosis - Midnight In Montreal.mp3'
import background from 'assets/background.jpg'

import Building from 'components/Building'
import Lamp from 'components/Lamp'

import Sound from 'utils/Sound'
import 'utils/OrbitControls'
import 'utils/EffectComposer'
import 'utils/RenderPass'
import 'utils/ShaderPass'
import 'utils/CopyShader'
import 'utils/LuminosityHighPassShader'
import 'utils/UnrealBloomPass'
import 'utils/FXAAShader'
import 'utils/MaskPass'
import 'utils/SSAOShader'
import 'utils/SSAOPass'

export default class App {
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'app'
    document.body.appendChild(this.container)

    window.THREE = THREE

    this.viewport = {
      width: 0,
      height: 0
    }

    this.init()
  }

  init() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)

    // Create simplex noise
    this.simplex = new SimplexNoise()

    // Set spectrum duplicates
    this.duplicates = 8

    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.TextureLoader().load(background)
    // this.scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

    // Create sound
    this.sound = new Sound(music, 95, 0, this.isLoaded.bind(this), true)

    // Create camera and set default position
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    // this.camera.position.set(0, 120, 0)
    this.camera.position.set(88, 44, -42)
    // this.camera.position.set(85, 37, -32)
    this.camera.lookAt(new THREE.Vector3(0, 2, 0))

    // Create clock
    this.clock = new THREE.Clock()

    // Create ambient light
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
    this.createGUI()

    // Create OrbitControls and plug it to camera
    this.controls = new THREE.OrbitControls(this.camera)

    // Setup meshes
    this.createGround()
    this.createBuildings()
    // this.createLights()

    // Postprocessing
    this.initPostprocessing()

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
    const size = Math.floor(Math.sqrt(256 * this.duplicates))
    this.buildings = []
    this.lamps = []
    this.objects = []

    for (let i = 0; i <= size; i++) {
      for (let j = 0; j <= size; j++) {
        const random = Math.random()
        const x = i * 2 + i * 0.5 - 50
        const z = j * 2 + j * 0.5 - 50
        if (random < 0.95) {
          const building = new Building()
          building.mesh.position.set(x, 0, z)
          this.buildings.push(building)
          this.objects.push(building)
          this.scene.add(building.mesh)
        } else {
          const lamp = new Lamp()
          lamp.mesh.position.set(x, Math.random() * 10, z)
          this.lamps.push(lamp)
          this.objects.push(lamp)
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
    const spectrum = this.sound.getSpectrum()
    this.controls.update()
    this.objects.forEach((object, i) => {
      object.mesh.position.y =
        (spectrum[Math.round(i / this.duplicates)] / 256) * 10 +
        this.simplex.noise2D(i * 200, i * 200 + et / 50) * 15
    })
    this.composer.render()
    this.stats.update()
  }

  isLoaded() {
    this.sound.onceAt('end', this.sound.duration, () => {
      console.log('SOUND IS ENDED')
    })
    this.sound.play()
  }

  onResize() {
    this.viewport = { width: window.innerWidth, height: window.innerHeight }
    this.camera.aspect = this.viewport.width / this.viewport.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.composer.setSize(this.viewport.width, this.viewport.height)
    this.ssaoPass.setSize(this.viewport.width, this.viewport.height)
    this.shaderPass.setSize(this.viewport.width, this.viewport.height)
  }

  initPostprocessing() {
    const renderPass = new THREE.RenderPass(this.scene, this.camera)
    this.composer = new THREE.EffectComposer(this.renderer)
    this.composer.setSize(this.viewport.width, this.viewport.height)
    this.composer.addPass(renderPass)

    this.ssaoPass = new THREE.SSAOPass(this.scene, this.camera)

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(this.viewport.width, this.viewport.height),
      1.5,
      0.4,
      0.85
    )
    this.bloomPass.threshold = this.options.bloomPass.threshold
    this.bloomPass.strength = this.options.bloomPass.strength
    this.bloomPass.radius = this.options.bloomPass.radius

    this.shaderPass = new THREE.ShaderPass(THREE.FXAAShader)
    this.shaderPass.renderToScreen = true

    this.composer.addPass(this.ssaoPass)
    this.composer.addPass(this.bloomPass)
    this.composer.addPass(this.shaderPass)
  }

  createGUI() {
    this.gui = new dat.GUI()
    this.options = {
      volume: 1,
      muted: false,
      bloomPass: { exposure: 1, threshold: 0.7, strength: 1.5, radius: 1 },
      ssaoPass: { onlyAO: false, radius: 32, aoClamp: 0.25, lumInfluence: 0.7 }
    }

    const sound = this.gui.addFolder('Sound')
    const bloomPass = this.gui.addFolder('BloomPass')
    const ssaoPass = this.gui.addFolder('SSAOPass')

    sound.open()
    ssaoPass.open()
    // bloomPass.open()

    this.sound.volume = this.options.volume

    sound
      .add(this.options, 'volume', 0, 1, 0.1)
      .listen()
      .onChange(value => {
        this.options.muted = value <= 0
        this.sound.volume = value
      })

    sound
      .add(this.options, 'muted')
      .listen()
      .onChange(value => {
        this.sound.volume = value ? 0 : 1
        this.options.volume = value ? 0 : 1
      })

    bloomPass
      .add(this.options.bloomPass, 'exposure', 0.1, 2)
      .onChange(
        value => (this.renderer.toneMappingExposure = Math.pow(value, 4.0))
      )
    bloomPass
      .add(this.options.bloomPass, 'threshold', 0, 1, 0.1)
      .onChange(value => {
        this.bloomPass.threshold = value
      })
    bloomPass
      .add(this.options.bloomPass, 'strength', 0, 3, 0.1)
      .onChange(value => {
        this.bloomPass.strength = value
      })
    bloomPass
      .add(this.options.bloomPass, 'radius', 0, 1, 0.01)
      .onChange(value => {
        this.bloomPass.radius = value
      })

    ssaoPass
      .add(this.options.ssaoPass, 'onlyAO', false)
      .onChange(value => (this.ssaoPass.onlyAO = value))
    ssaoPass
      .add(this.options.ssaoPass, 'radius', 0, 64)
      .onChange(value => (this.ssaoPass.radius = value))
    ssaoPass
      .add(this.options.ssaoPass, 'aoClamp', 0, 1)
      .onChange(value => (this.ssaoPass.aoClamp = value))
    ssaoPass
      .add(this.options.ssaoPass, 'lumInfluence', 0, 1)
      .onChange(value => (this.ssaoPass.lumInfluence = value))
  }
}
