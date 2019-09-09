import * as THREE from "three"
import Map from '../objects/Map' // 地图类
import Lamp from '../objects/Lamp'
import Logo from '../objects/Logo'
import LabelBase from '../objects/LabelBase'
import { getCenterExtraPoint, subArrayToLength } from '../utils'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const TWEEN = require('@tweenjs/tween.js')
const async = require('async')

var floorData
var trailList
var faceList

export default class TrailWorld {
  static scene
  static camera
  static renderer
  static mainGroup = new THREE.Group()
  elevatorGroup = new THREE.Object3D()
  width = window.innerWidth // 画布宽
  height = window.innerHeight // 画布高
  container = document.body // canvas画布容器
  storeList = []
  planeList = []

  clock = new THREE.Clock()
  duration = 1000 // 动画片段持续时间
  opacity = 0

  init () {
    TrailWorld.scene = new THREE.Scene()

    TrailWorld.camera = new THREE.PerspectiveCamera(25, this.width / this.height, 0.5, 10000)
    TrailWorld.camera.position.set(600, 300, 1200)

    TrailWorld.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    TrailWorld.renderer.setSize(this.width, this.height)
    TrailWorld.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(TrailWorld.renderer.domElement)

    LabelBase.create(this.container)

    this.createControls()
    this.createLight()
    this.createMall()
    this.render()

    this.elevatorGroup.name = 'elevator'
    TrailWorld.scene.add(this.elevatorGroup)
  }

  render() {
    TWEEN.update()
    requestAnimationFrame(() => { this.render() })
    // this.logoArr.forEach(item => {
      // item.lookAt(TrailWorld.camera.position)
    // })
    // this.castRay()
    TrailWorld.renderer.render(TrailWorld.scene, TrailWorld.camera)
    this.labelRenderer.render(TrailWorld.scene, TrailWorld.camera)
  }

  createMall () {
    async.each(floorData, (item, cb) => {
      this.map = new Map(TrailWorld.mainGroup)
      let group = new THREE.Group()
      group.name = item.floor
      group.userData.floor = item.floor
      group.userData.name = item.name
      this.map.loadTrailMap(item, group, () => {
        let center = this._getCenterExtraPoint(mesh.geometryAttributeArray)
        Logo.collection(group, center, path.color.r * 255)
        item.trieNodeList.forEach(store => {
          if (subArrayToLength(mesh.geometryAttribute) === subArrayToLength(store.coordinates) && mesh.name !== 'floorText') {
            mesh.userData.storeInfo = store
            this.createStoreText(store, mesh, group.name)
          }
        })
      }, cb)
      this.map.loadTrailPlane(item, group, this.planeList)
      TrailWorld.mainGroup.add(group)
    }, () => {
      TrailWorld.scene.add(TrailWorld.mainGroup)
      let firstPointFloor = parseInt(trailList[0].floorName)
      let firstFloor = TrailWorld.mainGroup.getObjectByName(firstPointFloor)
      if (firstFloor.userData.floor - 1 > 1) {
        TrailWorld.mainGroup.position.y = -120 * (firstFloor.userData.floor - 2)
      }
      this.createPath(firstPointFloor, 0)
      window.parent.postMessage({
        cmd: 'get_face_info',
        data: faceList[0],
        closeLoad: true
      }, '*')
    })
  }

  createControls () {
    var controls = new OrbitControls(TrailWorld.camera)
    controls.enableZoom = true
    controls.screenSpacePanning = true
    // controls.addEventListener('change', () => this.castRay())
  }

  createLight () {
    const lamp = new Lamp(ComWorld.scene)
    lamp.ambient(0.2)
    lamp.hemisphereLight(0.9)
  }
}

// 星图法要

// 为祸洛阳的陆科阴谋败露，梁宿直在天师道方士的救助下重返人间。
// 第一章：实际上是疯剑客和天师道的试探。疯剑客知道柳羊公是天师道组织的人，他揭发了柳羊公，

// 螟蛉
// 
// 陆科勾引金谷园一众侍女，又画了许多禁忌图，被发现后，石季伦一怒之下将其关在金谷园地牢中。
// 由于石季伦势力太大，尽管此事惊动洛阳城，但是无人能管。
// 随后，金谷园开始接连发生怪事。
// 石季伦广邀天下灵异之士，能除园中恶煞者，赏千金，奉为金谷园上宾。
// 
// 梁先生手里藏着柳羊公的最后一幅画，鹿望月。为此迷恋至深，茶饭不思。
// 梁妻吴晓柔不知其原因，只以为丈夫患心疾，四处访医，无果。
// 
// 柳羊公酒后出狂言，能解石公之宅变。
// 
// 月月你之前一直问我有没有什么想和你说的
// 我也没说出来 你有没有啥想对我说的 你对我的态度