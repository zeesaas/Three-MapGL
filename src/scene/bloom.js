const ASYNC = require("async")
const THREE = require("three")
const TWEEN = require("@tweenjs/tween.js")
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Map from "../objects/Map"
import Logo from "../objects/Logo"
import Bloom from '../objects/Bloom'
import { house } from "../../model/home"
import {
  subArrayToLength,
  getCenterExtraPoint,
  getQueryVariable,
  getRandom
} from "../utils"
import { PALLETE } from "../constants";
import { Tween } from "@tweenjs/tween.js";

export default class Shine {
  static scene // 场景
  static camera // 相机
  static renderer // 渲染器
  static mainGroup = new THREE.Group() // 商场总分组
  static status = "multi" // 场景状态
  static controls // 轨道

  width = window.innerWidth // 画布宽
  height = window.innerHeight // 画布高
  container = document.body // canvas画布容器

  clock = new THREE.Clock() // 动画clock
  storeList = [] // 为射线提供商店数组
  map // 初始化map类 - 每一层中的所有元素
  loop

  init() {
    const CAM_POS = new THREE.Vector3(700, 450, 1100)
    Shine.scene = new THREE.Scene()
    Shine.camera = new THREE.PerspectiveCamera( 30, this.width / this.height, 1, 10000 )
    Shine.camera.position.set(CAM_POS.x, CAM_POS.y, CAM_POS.z)
    Shine.camera.userData.position = CAM_POS // 备份相机初始位置值

    Shine.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    Shine.renderer.setSize(this.width, this.height)
    Shine.renderer.setPixelRatio(window.devicePixelRatio) // 设置屏幕像素比，防止在不同显示屏上模糊
    this.container.appendChild(Shine.renderer.domElement)

    this.map = new Map() // 初始化map类 - 每一层中的所有元素

    this.createControls()
    this.createLight()

    this.createMall(houseData.slice(0, 4)) // 创建商场
    this.animate()

    document.getElementById('shine').addEventListener('click', (event) => {
      event.stopPropagation()
      this.createShine()
    })

    document.getElementById('shine_loop').addEventListener('click', (event) => {
      this.loop = setInterval(() => {
        this.createShine()
      }, 1500)
    })

    document.getElementById('stop_loop').addEventListener('click', (event) => {
      clearInterval(this.loop)
      Bloom.list = []
    })
  }

  createShine () {
    const data = {
      floorIndex: Math.ceil(Math.random()*Math.floor(3)),
      imgUrl: './static/face/face_1.jpeg'
    }
    const coord = {
      x: getRandom(200, -200),
      z: getRandom(150, -150),
    }
    this.bloom.createPic(coord, data)
    this.bloom.createPoint(coord, data.floorIndex)
  }

  animate() {
    TWEEN.update()
    if (Bloom.list.length) {
      Bloom.list.forEach(item => {
        item.lookAt(Shine.camera.position)
      })
    }
    requestAnimationFrame(() => { this.animate() })
    Shine.controls.update()
    Shine.renderer.render(Shine.scene, Shine.camera);
  }

  // 创建Logo
  createLogo () {
    Shine.mainGroup.children.forEach(group => {
      group.children.forEach(mesh => {
        Logo.collection(mesh, group, '3d')
      })
    })
  }

  createMall (data) {
    ASYNC.each(
      data,
      (item, cb) => {
        let group = new THREE.Group();
        group.name = item.floor || 1;
        group.userData.floor = item.floor || 1;
        group.userData.name = item.floor || 1;
        group.userData.floorName = item.name;
        this.map.loadMap(item, group, cb);
        this.map.loadPlane(item, group);
        this.map.createFloorName(item.name, group);
        Shine.mainGroup.add(group);
      },
      () => {
        Shine.scene.add(Shine.mainGroup);
        this.createLogo();
        this.bloom = new Bloom(Shine.mainGroup)
      }
    );
  }

  createControls () {
    Shine.controls = new OrbitControls(Shine.camera)
    Shine.controls.screenSpacePanning = true
    // Shine.controls.autoRotate = true
    Shine.controls.autoRotateSpeed = 0.5
    Shine.controls.maxDistance = 3000
    Shine.controls.minDistance = 100
    Shine.controls.saveState()
  }

  createLight () {
    let AmbientLight = new THREE.AmbientLight(0xffffff, 0.2)
    Shine.scene.add(AmbientLight)
    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.9)
    Shine.scene.add(light)
  }
}

let houseData = house
let bloom = new Shine(houseData.floor)
bloom.init()