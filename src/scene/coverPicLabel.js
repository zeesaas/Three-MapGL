const ASYNC = require("async")
const THREE = require("three")
const TWEEN = require("@tweenjs/tween.js")
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Map from "../objects/Map";
import Lamp from '../objects/Lamp'
import Logo from '../objects/Logo'
import Gate from '../objects/Gate'
import Label2d from '../objects/Label2d'
import LabelBase from '../objects/LabelBase'
import Raycaster from "../objects/Raycaster"
import AABBBox from "../objects/AABBBox"; // AABB盒子类

import { house } from '../../model/home'
import { PALLETE } from '../constants'
import {getCenterExtraPoint, getRandom} from '../utils'

export default class Store {
  static scene // 场景
  static camera // 相机
  static renderer // 渲染器
  static mainGroup = new THREE.Group() // 商场总分组
  static controls // 轨道
  static schrodingerGate

  width = window.innerWidth // 画布宽
  height = window.innerHeight // 画布高
  container = document.body // canvas画布容器

  clock = new THREE.Clock() // 动画clock
  storeList = [] // 为射线提供商店数组
  map // 初始化map类 - 每一层中的所有元素

  init() {
    Store.scene = new THREE.Scene()
    Store.camera = new THREE.PerspectiveCamera( 30, this.width / this.height, 0.1, 10000 )
    Store.camera.position.set(0, -800, 600)
    Store.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    Store.renderer.setSize(this.width, this.height)
    Store.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(Store.renderer.domElement)
    LabelBase.create(this.container)
    this.aabbBox = new AABBBox(Store.camera);

    this.createControls()
    this.createLight()
    this.createMall()
    this.animate()

    document.getElementById('add_label').addEventListener('click', () => {
      this.createGate()
    })
    document.getElementById('update_label').addEventListener('click', () => {
      this.updateGate()
    })
    document.getElementById('delete_label').addEventListener('click', () => {
      this.deleteGate()
    })
    document.getElementById('custom_label').addEventListener('click', () => {
      this.customGate()
    })
  }

  animate () {
    requestAnimationFrame(() => { this.animate() })
    LabelBase.renderer.render(Store.scene, Store.camera)
    Store.renderer.render(Store.scene, Store.camera)
    Store.controls.update()
  }

  singleMesh
  createGate () {
    this.singleMesh = Gate.createRealGate('./static/camera-post.png')
    let coord = { x: getRandom(200, -200), y: getRandom(120, -120) }
    this.singleMesh.position.set(coord.x, coord.y, 10)
    Store.mainGroup.add(this.singleMesh)
  }

  updateGate () {
    if (!this.singleMesh) { return false }
    let area = this.judgeArea(this.singleMesh.position)
    this.singleMesh.position.set(this.singleMesh.position.x + area.x, this.singleMesh.position.y + area.y, 10)
    
  }

  deleteGate () {
    let gate = Store.mainGroup.getObjectByProperty('name', 'gate')
    Store.mainGroup.remove(gate)
  }

  customGate () {
    let gate = new Gate(
      Store.mainGroup,  
      Store.camera.position.z,
      Store.schrodingerGate
    )
    gate.create((mesh) => {
      let raycaster = new Raycaster(
        event,
        Store.camera,
        Store.renderer.domElement
      )
      let rayList = Map.planeList
      raycaster.handleEvent(rayList, intersect => {
        console.log(intersect)
        // let point = intersect[0].object.worldToLocal(intersect[0].point)
        let point = intersect[0].point
        mesh.position.set(point.x, point.y - 25, 10)
      })
    })
  }

  judgeArea (position) {
    if (position.x > 0 && position.y > 0) {
      return {x: -30, y: -30}
    } else if(position.x < 0 && position.y > 0) {
      return {x: 30, y: -30}
    } else if(position.x < 0 && position.y < 0) {
      return {x: 30, y: 30}
    } else if(position.x > 0 && position.y < 0) {
      return {x: -30, y: 30}
    }
  }

  createMall (floorInfo) {
    Store.mainGroup = new THREE.Group()
    floorInfo = floorInfo || houseData[floorIndex - 1]
    Store.mainGroup.name = floorInfo.floor
    this.map = new Map(Store.mainGroup)
    let promise = () => {
      return new Promise((resolve) => {
        this.map.loadSingleMap(floorInfo, Store.mainGroup, (mesh, color) => {
          Logo.collection(mesh, Store.mainGroup, '2d')
          resolve()
        })
      })
    }
    promise().then(() => {
      this.map.loadSinglePlane(floorInfo, Store.mainGroup)
    }).then(() => {
      this.createHeatColorInfo()
      Store.scene.add(Store.mainGroup)
    })
  }

  createHeatColorInfo() {
    Store.mainGroup.children.forEach((mesh, key) => {
      if (key % 2 === 0 && mesh.name === "store" && !this._isLogoColumn(mesh)) {
        mesh.material.color = this.setColor(1);
        this.storeList.push(mesh);
        this.bindGateText(mesh);
      }
    });
  }

  bindGateText(mesh) {
    let label = Label2d.create("商店名", "gateText", 14)
    let textCoord = getCenterExtraPoint(mesh.geometryAttributeArray)
    let aabb = this.aabbBox.create(textCoord, "商店名")
    if (textCoord) {
      label.position.set(textCoord.cx, textCoord.cy, 1)
      AABBBox.list.push({ ...aabb })
      label.add(aabb.sprite)
      Store.mainGroup.add(label)
    }
  }

  setColor(type) {
    let target = PALLETE.filter(item => item.type === type);
    return target[0].color;
  }

  _isLogoColumn(mesh) {
    const r = mesh.userData.color.r * 255;
    if (r === 44 || r === 45 || r === 46) {
      return true;
    }
    return false;
  }

  createControls () {
    Store.controls = new OrbitControls(Store.camera)
    Store.controls.screenSpacePanning = false
    Store.controls.enableRotate = false
    Store.controls.saveState()
    Store.controls.addEventListener('change', () => {
      this.aabbBox.update(AABBBox.list)
      this.aabbBox.checkCollusion(AABBBox.list)
    })
  }

  createLight () {
    const lamp = new Lamp(Store.scene)
    lamp.ambient(0.2)
    lamp.hemisphereLight(0.9)
  }
}

let houseData = house
let floorIndex = 4
let store = new Store()
store.init()