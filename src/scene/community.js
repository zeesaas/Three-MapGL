import * as THREE from "three"
import Map from '../objects/Map' // 地图类
import MapDom from '../dom/MapDom' // create Dom
import Lamp from '../objects/Lamp'
import Logo from '../objects/Logo'
import Gate from '../objects/Gate'
import Pop2D from '../objects/Pop2d'
import Label2d from '../objects/Label2d'
import MapStyle from '../dom/MapStyle' // create Dom style
import AABBBox from '../objects/AABBBox'
import LabelBase from '../objects/LabelBase'
import { getCenterExtraPoint, subArrayToLength } from '../utils'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const pallete = [
  { type: 0, color: new THREE.Color('#4A5ABA') },
  { type: 1, color: new THREE.Color('#4A5ABA') },
  { type: 2, color: new THREE.Color('#3249C9') },
  { type: 3, color: new THREE.Color('#2B51ED') },
  { type: 4, color: new THREE.Color('#6201ED') },
  { type: 5, color: new THREE.Color('#6201ED') }
]

export default class ComWorld {
  static scene
  static camera
  static renderer
  static mainGroup
  static schrodingerGate = new THREE.Object3D()

  width = window.innerWidth
  height = window.innerHeight
  container = document.body

  spriteList = []

  init () {
    ComWorld.scene = new THREE.Scene()
    ComWorld.camera = new THREE.PerspectiveCamera(
      30, 
      this.width / this.height, 
      0.1, 
      10000
    )
    ComWorld.camera.position.set(0, 0, 900)
    ComWorld.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    ComWorld.renderer.setSize(this.width, this.height)
    ComWorld.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(ComWorld.renderer.domElement)

    LabelBase.create(this.container)

    this.createControls()
    this.createLight()
    this.createMall()
    this.eventCollection()
    this.animate()

    this.pop2d = new Pop2D()
    this.pop2d.create(ComWorld.mainGroup)

    this.aabbBox = new AABBBox(ComWorld.camera)
  }

  animate () {
    requestAnimationFrame(() => { this.animate() })
    LabelBase.renderer.render(ComWorld.scene, ComWorld.camera)
    ComWorld.renderer.render(ComWorld.scene, ComWorld.camera)
    ComWorld.controls.update()
  }

  createMall (floorInfo) {
    ComWorld.mainGroup = new THREE.Group()
    floorInfo = floorInfo || houseData[floorIndex - 1]
    ComWorld.mainGroup.name = floorInfo.floor
    this.map = new Map(ComWorld.mainGroup)
    let promise = () => {
      return new Promise((resolve) => {
        this.map.loadSingleMap(floorInfo, ComWorld.mainGroup, (mesh, color) => {
          Logo.collection(mesh, ComWorld.mainGroup, '2d')
          resolve()
        })
      })
    }
    promise().then(() => {
      this.map.loadSinglePlane(floorInfo, ComWorld.mainGroup)
    }).then(() => {
      window.parent.postMessage({
        cmd: 'to_single',
        data: floorIndex
      }, '*')
      ComWorld.scene.add(ComWorld.mainGroup)
    })
  }

  onDocumentMouseClick (event) {
    const mouse = new THREE.Vector2()
    const container = ComWorld.renderer.domElement
    const raycaster = new THREE.Raycaster()
    const rayList = this.spriteList
  
    mouse.x = (event.clientX / container.clientWidth) * 2 - 1
    mouse.y = - (event.clientY / container.clientHeight) * 2 + 1
    raycaster.setFromCamera(mouse, ComWorld.camera)
    
    let intersects = raycaster.intersectObjects(rayList)
    if (intersects.length > 0) {
      if (intersects[0].object.name === 'gate') {
        delete intersects[0].object.info.coord
        window.parent.postMessage({
          cmd: 'gate_info',
          data: intersects[0].object.info
        }, '*')
      }
    }
  }

  onDocumentMouseMove (event) {
    const mouse = new THREE.Vector2()
    const container = ComWorld.renderer.domElement
    const raycaster = new THREE.Raycaster()
    const rayList = this.spriteList

    mouse.x = (event.clientX / container.clientWidth) * 2 - 1
    mouse.y = - (event.clientY / container.clientHeight) * 2 + 1
    
    raycaster.setFromCamera(mouse, ComWorld.camera)
    const intersects = raycaster.intersectObjects(rayList)

    if (intersects.length > 0) {
      const target = intersects[0].object
      if (target.name === 'gate') {
        this.pop2d.moved(target.info.name, target.position)
      } 
    }else {
      this.pop2d.reset()
    }
  }

  onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight
    ComWorld.camera.aspect = width / height
    ComWorld.camera.updateProjectionMatrix()
    ComWorld.renderer.setSize(width, height)
    LabelBase.renderer.setSize(width, height)
  }

  receiveExistGateInfo (data) {
    if (!data) return
    const tipText = document.getElementsByClassName('tip-text')
    if (status === 'join') {
      tipText[0].innerText = '加入单店出入口'
      return 
    }
    const gateList = MapDom.createExistGateInner(data)
    gateList.addEventListener('click', e => {
      let floor = this.currentFloor
      this.createGate(gateList, e, this.spriteList, floor)
      tipText[0].innerText = '已建出入口/通道可移动到地图对应位置'
    }, false)
  }

  receiveGateInfo(data) {
    this.spriteList = []
    this.gateData = data
    this.gateData.forEach(item => {
      if (item.type === 1) item.src = './static/camera-inside.png'
      else if (item.type === 2) item.src = './static/camera-outside.png'
      else item.src = './static/camera-post.png'
      let data = { id: item.portalGuid, name: item.name }
      let trigger = true
      let mesh = Gate.createRealGate(item.src, data, trigger)
      mesh.position.set(item.coord.x, item.coord.y, 10)
      mesh.info = data
      this.spriteList.push(mesh)
      ComWorld.mainGroup.add(mesh)
    })
  }

  handleNavChangeFloor (data) {
    floorIndex = data.floorIndex
    let floorInfo = {
      mapBaseboard: data.mapBaseboard,
      floor: floorIndex,
      name: data.name,
      url: data.floorMap.split('?')[0]
    }
    
    Label2d.clear(ComWorld.mainGroup)
    Logo.clear(ComWorld.mainGroup)
    ComWorld.scene.remove(ComWorld.mainGroup)
    
    this.createMall(floorInfo)
    this.pop2d.create(ComWorld.mainGroup)
  }

  receiveColorInfo (data) {
    this.colorData = data
    this.colorData.forEach(item => {
      let floorIndex = item.floor
      ComWorld.mainGroup.children.forEach((mesh) => {
        if (subArrayToLength(mesh.geometryAttribute) === subArrayToLength(item.coordinates) && mesh.name !== 'floorText') {
          mesh.material.color = this.setColor(3)
          this.bindGateText(item, mesh, floorIndex)
        }
      })
    })
    this.aabbBox.checkCollusion(AABBBox.list)
  }

  // 创建已绑定商店的文字
  bindGateText (item, mesh) {
    let label = Label2d.create(item.name, 'gateText', 12)
    let textCoord = getCenterExtraPoint(mesh.geometryAttributeArray)
    let aabb = this.aabbBox.create(textCoord, item.name)
    
    if (textCoord) {
      label.position.set(textCoord.cx, textCoord.cy, 10)
      AABBBox.list.push({...aabb})
      label.add(aabb.sprite)
      ComWorld.mainGroup.add(label)
    }
  }

  setColor(type) {
    let target = pallete.filter(item => item.type === type)
    return target[0].color
  }

  createGate (el, e, spriteList, id) {
    let gate = new Gate(
      ComWorld.mainGroup,  
      ComWorld.camera.position.z,
      ComWorld.schrodingerGate
    )
    gate.create(el, e, spriteList, id)
  }

  createControls () {
    ComWorld.controls = new OrbitControls(ComWorld.camera)
    ComWorld.controls.screenSpacePanning = false
    ComWorld.controls.enableRotate = false
    ComWorld.controls.saveState()
    ComWorld.controls.addEventListener('change', () => {
      this.aabbBox.update(AABBBox.list)
      this.aabbBox.checkCollusion(AABBBox.list)
    })
  }

  createLight () {
    const lamp = new Lamp(ComWorld.scene)
    lamp.ambient(0.2)
    lamp.hemisphereLight(0.9)
  }

  createAlex() {
    let axesHelper = new THREE.AxesHelper(100)
    ComWorld.scene.add(axesHelper)
  }

  eventCollection () {
    const gateEl = document.getElementById('gate-group')
    gateEl.addEventListener('click', e => {
      let currentFloor = this.currentFloor
      this.createGate(gateEl, e, this.spriteList, currentFloor)
    }, false)
    window.addEventListener('mousedown', () => {
      this.onDocumentMouseClick(event)
    }, false)
    window.addEventListener('resize', () => {
      this.onWindowResize(event)
    }, false)
    window.addEventListener('mousemove', () => {
      this.onDocumentMouseMove(event)
    })
  }
}

let comWorld = null
let houseData = []
let floorIndex = 1
let status = null

document.body.style.background = '#ffffff'

window.parent.postMessage({
  cmd: 'associate-load_signal'
}, '*')

window.addEventListener('message', () => {
  handleMessage(event)
})

function handleMessage (event) {
  const data = event.data
  switch (data.cmd) {
    case 'map_data':
      houseData = data.data;
      floorIndex = data.floor;
      new MapDom(1, houseData)
      new MapStyle(1)
      comWorld = new ComWorld()
      comWorld.init()

      let gateRedEl = document.getElementsByClassName('gate-red')[0]
      let gateOrangeEl = document.getElementsByClassName('gate-orange')[0]
      let gateGreenEl = document.getElementsByClassName('gate-green')[0]

      status = data.status
      if (data.status === 'store') {
        gateRedEl.style.display = 'block'
        gateOrangeEl.style.display = 'block'
        gateGreenEl.style.display = 'block'
      } else if(data.status === 'single'){
        gateRedEl.style.display = 'block'
        gateOrangeEl.style.display = 'block'
        gateGreenEl.style.display = 'none'
      } else {
        gateRedEl.style.display = 'none'
        gateOrangeEl.style.display = 'none'
        gateGreenEl.style.display = 'none'
      }
      break;
    case 'gate_data':
      comWorld.receiveGateInfo(data.data)
      break
    case 'gate_cancel':
      Gate.cancel(data.type, ComWorld.mainGroup, ComWorld.schrodingerGate)
      break
    case 'nav_change_floor':
      comWorld.handleNavChangeFloor(data.data)
      break
    case 'exist_gate_data':
      comWorld.receiveExistGateInfo(data.data)
      break
    case 'color_data':
      let data2
      if (data.data.trieNodeList) {
        data2 = data.data.trieNodeList
      } else {
        data2 = data.data
      }
      comWorld.receiveColorInfo(data.data)
      break
  }
}