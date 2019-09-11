const ASYNC = require('async')
const THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import Map from '../objects/Map'
import MapDom from '../dom/MapDom'
import Light from '../objects/Light' // 闪点效果类
import Bloom from '../objects/Bloom'
import Logo from '../objects/Logo'
import MapStyle from '../dom/MapStyle'
import AABBBox from '../objects/AABBBox' // AABB盒子类
import Label2d from '../objects/Label2d' // 2D标签类
import LabelBase from '../objects/LabelBase'
import Raycaster from '../objects/Raycaster'
import PointLight from '../objects/PointLight'
import TweenFloor from '../animation/TweenFloor'
import TweenStore from '../animation/TweenStore'
import {
  subArrayToLength, 
  getCenterExtraPoint,
  getQueryVariable
} from '../utils'
import {
  PALLETE
} from '../constants'
import { house } from '../../model/home'

/**
 * 功能：
 * 创建地图：createMall
 * 
 */

export default class World {
  static scene // 场景
  static camera // 相机
  static renderer // 渲染器
  static mainGroup = new THREE.Group() // 商场总分组
  static status = 'multi' // 场景状态
  static controls // 轨道

  stats // 性能监控
  composer // 后期通道
  afterimagePass // afterImage通道
  fxaaPass // fxaa通道

  width = window.innerWidth // 画布宽
  height = window.innerHeight // 画布高
  container = document.body // canvas画布容器

  clock = new THREE.Clock() // 动画clock
  storeList = [] // 为射线提供商店数组
  
  // 初始化class
  tweenFloor // 初始化TweenFloor类 - 切换楼层动画
  map // 初始化map类 - 每一层中的所有元素
  animateFloor // TrackFloor类 - 上下楼动画

  constructor(floorIndex = 1) {
    this.floorIndex = floorIndex
  }

  init() {
    const CAM_POS = new THREE.Vector3(700, 450, 1100)
    World.scene = new THREE.Scene()
    // 调整整体位置
    World.mainGroup.position.y = 50
    World.mainGroup.position.z = -30

    World.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 10000)
    World.camera.position.set(CAM_POS.x, CAM_POS.y, CAM_POS.z)
    World.camera.userData.position = CAM_POS // 备份相机初始位置值

    World.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    World.renderer.setSize(window.innerWidth, window.innerHeight)
    // 设置屏幕像素比，防止在不同显示屏上模糊
    World.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(World.renderer.domElement)

    LabelBase.create(this.container)

    this.map = new Map() // 初始化map类 - 每一层中的所有元素
    this.pointLight = new PointLight(houseData.length)
    this.tweenFloor = new TweenFloor() // 初始化TweenFloor类 - 切换楼层动画
    this.aabbBox = new AABBBox(World.camera)

    this.createControls()
    this.createLight()
    this.pointLight.create(World.scene)

    const houseDataOrigin = houseData.length <= 4 ? houseData : houseData.slice(0, 4)
    this.createMall(houseDataOrigin, true) // 创建商场
    
    this.animate()

    window.addEventListener('mousedown', (event) => {
      event.stopPropagation();
      this.onDocumentMouseClick(event)
    }, false)
    window.addEventListener('resize', () => {
      this.onWindowResize(event)
    }, false)
    document.getElementById('back').addEventListener('click', () => {
      this.handleNavChangeFloor({})
    })
  }

  // 创建商场
  createMall(data, isFirst) {
    ASYNC.each(data, (item, cb) => {
      let group = new THREE.Group()
      group.name = item.floor || 1
      group.userData.floor = item.floor || 1
      group.userData.name = item.floor || 1
      group.userData.floorName = item.name
      this.map.loadMap(item, group, cb)
      this.map.loadPlane(item, group)
      this.map.createFloorName(item.name, group)
      World.mainGroup.add(group)
    }, () => {
      if (isFirst) {
        World.scene.add(World.mainGroup)
        let houseDataLast = houseData.slice(4, houseData.length)
        this.createMall(houseDataLast)
        this._postMessage({cmd: 'close_load'})
      }
      this.createLogo()
    })
  }

  rayStoreInfo = {}
  rayCurrentGroup = new THREE.Object3D
  onDocumentMouseClick (event) {
    let raycaster = new Raycaster(event, World.camera, World.renderer.domElement)
    let rayList = []
    if (World.status === 'multi') {
      rayList = Map.planeList
      raycaster.handleEvent(rayList, intersect => {
        this.multiToSingle(intersect[0])
        this.handleFloorNav(intersect[0].object)
      })
    } else {
      rayList = this.storeList
      raycaster.handleEvent(rayList, intersects => {
        this.rayStoreInfo = intersects[0].object.userData.storeInfo || {}
        this.rayCurrentGroup = intersects[0].object.parent
        this.intersectOption(intersects[0].object, 1)
        this.createSingleStoreDom(this.rayStoreInfo.name, this.rayCurrentGroup)
      }, () => {
        let data = {name: this.rayStoreInfo.name, floor: this.rayCurrentGroup.userData.floorName}
        this.backToFloor(data)
        this._postMessage({
          cmd: 'callBackToFloor',
          data: data
          // data: {}
        })
      })
    }
  }

  _getGroupInfo (floor) {
    let group = World.mainGroup.children[floor]
    let groupInfo = group.userData.groupInfo
    return groupInfo
  }

  onWindowResize() {
    var width = window.innerWidth
    var height = window.innerHeight
    World.camera.aspect = width / height
    World.camera.updateProjectionMatrix()
    World.renderer.setSize(width, height)
    LabelBase.renderer.setSize(width, height)
  }

  createSingleStoreDom(name, group) {
    this._postMessage({
      cmd: 'createSingleStore',
      data: { name: name, floor: group.userData.floorName }
    })
  }

  // switch: m - s
  multiToSingle (intersect, name) {
    let basicData = {}
    this.storeList = []
    World.controls.autoRotate = false
    Bloom.clearShine(World.scene)
    this.pointLight.visible(false)

    if (typeof intersect === 'object') {
      basicData = {
        key: 'name',
        value: intersect.object.parent.name,
        groupInfo: intersect.object.userData.groupInfo
      }
    } else {
      basicData = {
        key: 'floor',
        value: intersect,
        groupInfo: this._getGroupInfo(parseInt(intersect) - 1)
      }
    }

    World.mainGroup.children[basicData.value - 1].children.forEach(mesh => {
      if (mesh.name === 'store') {
        this.map.changeMaterial(mesh)
      }
    })

    this.floorIndex = basicData.value
    this.tweenFloor.multiToSingle(basicData, name)
    this.receiveHeatColorInfo(this.floorIndex)
  }

  // switch: s - s
  singleToSingle(floor) {
    this.storeList = []
    this.floorIndex = floor
    Bloom.clearShine()
    World.mainGroup.children[floor - 1].children.forEach(mesh => {
      if (mesh.name === 'store') this.map.changeMaterial(mesh)
    })
    this.tweenFloor.singleToSingle(floor)
  }

   // switch：s - m
   singleToMulti() {
    World.controls.autoRotate = true
    this.pointLight.visible(true)
    World.mainGroup.children.forEach(group => {
      group.children.forEach(mesh => {
        if (mesh.name === 'store') this.map.changeAllMaterial(mesh)
      })
    })
    this.tweenFloor.singleToMulti()
  }

  intersectOption (object3d, isFromFloor = 0) {
    let mesh = object3d
    mesh.isSingle = true
    Label2d.clear(mesh.parent)
    this.storeList.forEach(item => {
      if (item === mesh) {
        TweenStore.enter(mesh)
      } else if(item !== mesh && item.isSingle) {
        item.isSingle = false
        TweenStore.leave(item)
      }
    })

    if (isFromFloor) {
      this._postMessage({
        cmd: 'store_info',
        data: object3d.userData.storeInfo
      }, '*')
    }
  }

  handleFloorNav (mesh) {
    let floorIndex = mesh.parent ? mesh.parent.name : mesh.floorIndex
    this._postMessage({
      cmd: 'floor-change-nav',
      data: floorIndex
    })
  }

  animate () {
    TWEEN.update()
    
    let delta = this.clock.getDelta()
    if (Light.mixer) { Light.mixer.update(delta) }
    if (Bloom.list.length) {
      Bloom.list.forEach(item => {
        item.lookAt(World.camera.position)
      })
    }
    
    let time = Date.now() * 0.002
    this.pointLight.animate(time)

    requestAnimationFrame(() => { this.animate() })
    World.controls.update()
    World.renderer.render(World.scene, World.camera)
    LabelBase.renderer.render(World.scene, World.camera)
  }

  // 创建Logo
  createLogo () {
    World.mainGroup.children.forEach(group => {
      group.children.forEach(mesh => {
        Logo.collection(mesh, group, '3d')
      })
    })
  }

  // 创建闪点
  // data.coordinates: 坐标点位; data.floorIndex: 楼层编号;
  shiningTrigger(data) {
    const bloom = new Bloom(World.mainGroup)
    const coordinates = data.coordinates.split(',')
    // 判断状态：只在多层时显示闪点
    if (World.status === 'multi') {
      const coord = {
        x: parseInt(coordinates[0]),
        z: parseInt(coordinates[1])
      }
      bloom.createPic(coord, data)
      bloom.createPoint(coord, data.floorIndex)
    }
  }

  _isLogoColumn (mesh) {
    console.log(mesh)
    const r = mesh.userData.color.r * 255
    if (r === 44 || r === 45 || r === 46) {
      return true
    }
    return false
  }

  // 首页：绑定颜色块
  receiveHeatColorInfo (value) {
    World.mainGroup.children[value - 1].children.forEach((mesh, key) => {
      if (key % 2 === 0 && mesh.name === 'store' && !this._isLogoColumn(mesh)) {
        mesh.material.color = this.setColor(1)
        this.storeList.push(mesh)
        this.bindGateText( mesh, value)
      }
      // if (mesh.name === 'store' && )
      // if (subArrayToLength(mesh.geometryAttribute) === subArrayToLength(item.coordinates)) {
      //   mesh.material.color = this.setColor(item.type)
      //   mesh.userData.storeInfo = item
      //   this.storeList.push(mesh)
      //   this.bindGateText(item, mesh, floorIndex)
      // }
    })
  }

  setColor(type) {
    let target = PALLETE.filter(item => item.type === type)
    return target[0].color
  }

  backToFloor(data) {
    World.mainGroup.children.forEach(group => {
      if (group.userData.floorName === data.floor) {
        this.singleStoreToSingle(group)
        return
      }
    })
  }

  callSingleStore(data) {
    let floor = parseInt(data.floorIndex)
    let group = World.mainGroup.getObjectByName(floor)
    let timeout
    group.children.forEach(mesh => {
      if (mesh.geometryAttribute && 
        subArrayToLength(mesh.geometryAttribute) === subArrayToLength(data.geometryAttribute)
      ){
        this.changeFloor(floor, data.name)
        World.status === 'multi' ? (timeout = 2500) : (timeout = 500)
        setTimeout(() => {
          this.intersectOption(mesh, 1)
          this.createSingleStoreDom(data.name, group)
        }, timeout)
        return
      }
    })
  }

  singleStoreToSingle(group) {
    let mesh = group.getObjectByProperty('isSingle', true)
    mesh.isSingle = false
    let start = { scale: 1.1, opacity: 0.1 }
    let end = { scale: 1, opacity: 1 }
    console.log(Label2d.arr)
    Label2d.arr.forEach(label => group.add(label))
    this.aabbBox.checkCollusion()
    let action = new TWEEN.Tween(start).to(end, 500).onUpdate(() => {
      mesh.scale.x = start.scale
      mesh.scale.y = start.scale
      mesh.scale.z = start.scale
      group.children.forEach(mesh => {
        if (mesh.name === 'plane') {
          mesh.material.opacity = start.opacity / (1 / 0.3)
        } else if (
          mesh.name !== 'plane' && 
          mesh.name !== 'gateText' && 
          mesh.name !== '2dLogo'
        ){
          mesh.material.opacity = start.opacity
        }
      })
    })
    action.start()
    this._postMessage({
      cmd: 'to_single',
      groupInfo: group.userData.groupInfo
    })
    this._postMessage({
      cmd: 'floor-change-nav',
      data: group.name
    })
  }

  handleNavChangeFloor(data) {
    if (data.floorIndex) {
      const floor = data.floorIndex
      this.changeFloor(floor, data.name)
    } else {
      this.singleToMulti()
      this.handleFloorNav({ floorIndex: 0 })
    }
  }

  // 创建已绑定商店的文字
  bindGateText(mesh, floorIndex) {
    let label = Label2d.create('商店名', 'gateText', 14)
    let textCoord = getCenterExtraPoint(mesh.geometryAttributeArray)
    let aabb = this.aabbBox.create(textCoord, '商店名')
    if (textCoord) {
      label.position.set(textCoord.cx, 1, -textCoord.cy)
      AABBBox.list.push({...aabb})
      label.add(aabb.sprite)
      World.mainGroup.children[floorIndex - 1].add(label)
    }
  }

  // 以多层为入口切换楼层
  // 以单层为入口切换楼层
  changeFloor(floor, name = '') {
    if (World.status === 'multi') {
      this.multiToSingle(floor, name)
    } else {
      this.singleToSingle(floor)
    }
  }

  createControls () {
    World.controls = new OrbitControls(World.camera)
    World.controls.screenSpacePanning = true
    World.controls.autoRotate = true
    World.controls.autoRotateSpeed = 0.5
    World.controls.maxDistance = 2000
    World.controls.minDistance = 500
    World.controls.saveState()
    World.controls.addEventListener('change', () => {
      this.aabbBox.update(AABBBox.list)
      this.aabbBox.checkCollusion(AABBBox.list)
    })
  }

  createLight () {
    let AmbientLight = new THREE.AmbientLight(0xffffff, 0.2)
    World.scene.add(AmbientLight)
    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.9)
    World.scene.add(light)
  }

  createAlex() {
    let axesHelper = new THREE.AxesHelper(100)
    World.scene.add(axesHelper)
  }

  _postMessage (opt) {
    window.parent.postMessage(opt, '*')
  }
}

let houseData = [], world
const mode = parseInt(getQueryVariable('mode'))

window.parent.postMessage({
  cmd: 'home-load_signal'
}, '*')

window.addEventListener('message', () => {
  handleMessage(event)
})

houseData = house
// new MapDom(mode, houseData)
// new MapStyle(mode)
world = new World(houseData.floor)
world.init()

function handleMessage (event) {
  const data = event.data
  switch (data.cmd) {
    case 'heat_color_data':
      world.receiveHeatColorInfo(data.data.trieNodeList)
      break
    case 'call_single_store':
      world.callSingleStore(data.data)
      break
    case 'back_to_floor':
      world.backToFloor(data.data)
      break
    case 'nav_change_floor':
      world.handleNavChangeFloor(data.data)
      break
    case 'shine_info':
      world.shiningTrigger(data.data)
      break
  }
}
