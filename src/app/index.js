import css from './styles.scss'
import 'reset-css'

import * as THREE from 'three'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import SimplexNoise from 'simplex-noise'

// import music from 'assets/Topo & Roby - Under The Ice instrumental-GGjbjxmOW_4.mp3'
import music from 'assets/Queen - Bohemian Rhapsody.mp3'
import background from 'assets/background.jpg'
import headset from 'assets/headset.svg'

import Building from 'components/Building'
import Lamp from 'components/Lamp'
import Bubble from 'components/Bubble'

import Sound from 'utils/Sound'
import Peti from 'utils/Peti'
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
import 'utils/BokehShader'
import 'utils/BokehPass'

export default class App {
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'app'
    document.body.appendChild(this.container)

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
    this.duplicates = 14

    // Create scene
    this.scene = new THREE.Scene()
    // this.scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

    // Create homepage
    this.initHome()

    // Create sound
    this.sound = new Sound(music, 140, 0, this.isLoaded.bind(this), false)

    // Create camera and set default position
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(76.6804, 41.9298, -45.498)
    this.camera.rotation.set(-2.5089, 0.9371, 2.6079)

    // Create clock
    this.clock = new THREE.Clock()

    // Create ambient light
    // const ambientLight = new THREE.AmbientLight(0x404040)
    const ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(ambientLight)

    // Debug DirectionalLight
    const goldDirectionalLight = new THREE.DirectionalLight(0xf0d499, 0.6)
    goldDirectionalLight.position.set(90, 30, -65)
    this.scene.add(goldDirectionalLight)
    const blueDirectionalLight = new THREE.DirectionalLight(0x05679b, 1)
    blueDirectionalLight.position.set(90, 30, -65)
    this.scene.add(blueDirectionalLight)

    // Spotlight
    const leftSpotLight = new THREE.SpotLight(0x05679b, 1.75, 500, 1)
    leftSpotLight.position.set(50, 50, 50)
    this.scene.add(leftSpotLight)
    const rightSpotLight = new THREE.SpotLight(0x05679b, 0.5, 500, 1)
    rightSpotLight.position.set(0, 100, 0)
    this.scene.add(rightSpotLight)

    // Create stats
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    // Create dat.gui
    this.options = {
      global: {
        velocity: 1,
        opera: () => {
          this.sound.pause()
          this.sound.play(0)
          this.sound.play(170)
        }
      },
      bokeh: {
        focus: 95,
        aperture: 1.5,
        maxblur: 3.0,
        farClip: 1000,
        nearClip: 0.1
      },
      sound: { volume: 1, muted: false },
      bloomPass: { exposure: 1, threshold: 0.7, strength: 0.8, radius: 0.8 },
      ssaoPass: { onlyAO: false, radius: 32, aoClamp: 0.25, lumInfluence: 0.7 }
    }
    this.createGUI()

    // Create OrbitControls and plug it to camera
    this.controls = new THREE.OrbitControls(this.camera)

    // Setup meshes
    this.createDecor()
    this.createBuildings()
    this.createBubbles()

    // Postprocessing
    this.initPostprocessing()

    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  createDecor() {
    const geometry = new THREE.SphereBufferGeometry(200, 30, 30)
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(background)
    })
    material.side = THREE.BackSide
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.z = Math.PI
    this.scene.add(mesh)
  }

  createBuildings() {
    const size = Math.floor(Math.sqrt(170 * this.duplicates))
    this.buildings = []
    this.lamps = []
    this.objects = []

    const building = new Building()
    const lamp = new Lamp()

    for (let i = 0; i <= size; i++) {
      for (let j = 0; j <= size; j++) {
        const random = Math.random()
        const x = i * 2 + i * 0.5 - 50
        const z = j * 2 + j * 0.5 - 50
        const clone = random < 0.95 ? building.mesh.clone() : lamp.mesh.clone()
        if (random < 0.95) {
          clone.position.set(x, 0, z)
          this.buildings.push(clone)
        } else {
          clone.position.set(x, Math.random() * 10, z)
          this.lamps.push(clone)
        }
        this.objects.push(clone)
        this.scene.add(clone)
      }
    }
  }

  createBubbles() {
    this.bubbles = []
    const bubble = new Bubble()

    for (let i = 0; i < 20; i++) {
      const clone = bubble.light.clone()
      this.bubbles.push(clone)
      this.scene.add(clone)
    }
  }

  render() {
    const et = this.clock.getElapsedTime()
    const spectrum = this.sound.getSpectrum()
    this.controls.update()
    this.objects.forEach((object, i) => {
      object.position.y =
        (spectrum[Math.round(i / this.duplicates)] / 256) * 10 +
        this.simplex.noise2D(i * 200, i * 200 + et / 50) * 15
    })
    this.bubbles.forEach((bubble, i) => {
      bubble.position.x =
        (bubble.position.x +
          (this.simplex.noise2D(i, et / 50) / 2) *
            this.options.global.velocity) %
        100
      bubble.position.z =
        (bubble.position.z +
          (this.simplex.noise2D(et / 50, i) / 2) *
            this.options.global.velocity) %
        100
    })
    this.composer.render()
    this.stats.update()
  }

  isLoaded() {
    document.getElementById('button').disabled = false
    this.sound.onceAt('end', this.sound.duration, () => {
      console.log('SOUND IS ENDED')
    })
    this.sound
      .createKick({
        frequency: [20, 40],
        threshold: 90,
        decay: 1,
        onKick: () => {
          this.options.global.velocity = 3
        },
        offKick: () => {
          this.options.global.velocity = 1
        }
      })
      .on()
    this.sound.onceAt('white', 182.5, () => {
      const mtl = Building.white()
      this.buildings.forEach(mesh => (mesh.material = mtl))
    })
    this.sound.onceAt('black', 247.75, () => {
      const mtl = Building.black()
      this.buildings.forEach(mesh => (mesh.material = mtl))
    })
  }

  onResize() {
    this.viewport = { width: window.innerWidth, height: window.innerHeight }
    this.camera.aspect = this.viewport.width / this.viewport.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.composer.setSize(this.viewport.width, this.viewport.height)
    this.ssaoPass.setSize(this.viewport.width, this.viewport.height)
    this.bokehPass.setSize(this.viewport.width, this.viewport.height)
    this.shaderPass.setSize(this.viewport.width, this.viewport.height)
  }

  initPostprocessing() {
    const renderPass = new THREE.RenderPass(this.scene, this.camera)
    this.composer = new THREE.EffectComposer(this.renderer)
    this.composer.setSize(this.viewport.width, this.viewport.height)

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

    this.bokehPass = new THREE.BokehPass(this.scene, this.camera, {
      focus: 1.0,
      aperture: 0.025,
      maxblur: 2.0
    })
    this.bokehPass.renderToScreen = true

    this.matChanger()

    this.composer.addPass(renderPass)
    this.composer.addPass(this.bloomPass)
    this.composer.addPass(this.shaderPass)
    this.composer.addPass(this.ssaoPass)
    this.composer.addPass(this.bokehPass)
  }

  initHome() {
    const home = (
      <div className={css.Home} id="home">
        <div className={css.container}>
          <h1>Hello</h1>
          <div>
            <img src={headset} />
            <p>Welcome, don't forget your headset !</p>
          </div>
          <button id="button" disabled>
            Get started!
          </button>
        </div>
      </div>
    )
    this.container.appendChild(home)
    document.getElementById('button').addEventListener('click', () => {
      document.getElementById('home').classList.add(css.hide)
      this.sound.play()
    })
  }

  createGUI() {
    this.gui = new dat.GUI()

    const global = this.gui.addFolder('Global')
    const sound = this.gui.addFolder('Sound')
    const bloomPass = this.gui.addFolder('BloomPass')
    const ssaoPass = this.gui.addFolder('SSAOPass')
    const bokehPass = this.gui.addFolder('Bokeh')

    // global.open()
    // sound.open()
    // ssaoPass.open()
    // bloomPass.open()
    // bokehPass.open()
    this.gui.close()

    global.add(this.options.global, 'velocity', 1, 4, 0.1).listen()
    global.add(this.options.global, 'opera')

    sound
      .add(this.options.sound, 'volume', 0, 1, 0.1)
      .listen()
      .onChange(value => {
        this.options.muted = value <= 0
        this.sound.volume = value
      })

    sound
      .add(this.options.sound, 'muted')
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
      .listen()
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

    bokehPass
      .add(this.options.bokeh, 'focus', 10.0, 3000.0, 10)
      .onChange(this.matChanger.bind(this))
    bokehPass
      .add(this.options.bokeh, 'aperture', 0, 10, 0.1)
      .onChange(this.matChanger.bind(this))
    bokehPass
      .add(this.options.bokeh, 'maxblur', 0.0, 3.0, 0.025)
      .onChange(this.matChanger.bind(this))
    bokehPass
      .add(this.options.bokeh, 'nearClip', 0.1, 1000, 0.1)
      .onChange(this.matChanger.bind(this))
    bokehPass
      .add(this.options.bokeh, 'farClip', 0.1, 1000, 0.1)
      .onChange(this.matChanger.bind(this))
  }

  matChanger() {
    this.bokehPass.uniforms['farClip'].value = this.options.bokeh.farClip
    this.bokehPass.uniforms['nearClip'].value = this.options.bokeh.nearClip
    this.bokehPass.uniforms['focus'].value = this.options.bokeh.focus
    this.bokehPass.uniforms['aperture'].value =
      this.options.bokeh.aperture * 0.00001
    this.bokehPass.uniforms['maxblur'].value = this.options.bokeh.maxblur
  }
}
