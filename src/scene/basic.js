const ASYNC = require("async");
const THREE = require("three");
const TWEEN = require("@tweenjs/tween.js");

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Map from "../objects/Map";
import Logo from "../objects/Logo";
import Raycaster from "../objects/Raycaster";
import TweenFloor from "../animation/TweenFloor";
import Label2d from "../objects/Label2d"; // 2D标签类
import LabelBase from "../objects/LabelBase";
import { house } from "../../model/home";
import AABBBox from "../objects/AABBBox"; // AABB盒子类
import {
  subArrayToLength,
  getCenterExtraPoint,
  getQueryVariable
} from "../utils";
import { PALLETE } from "../constants";

export default class Basic {
  static scene; // 场景
  static camera; // 相机
  static renderer; // 渲染器
  static mainGroup = new THREE.Group(); // 商场总分组
  static status = "multi"; // 场景状态
  static controls; // 轨道

  width = window.innerWidth; // 画布宽
  height = window.innerHeight; // 画布高
  container = document.body; // canvas画布容器

  clock = new THREE.Clock(); // 动画clock
  storeList = []; // 为射线提供商店数组

  tweenFloor; // 初始化TweenFloor类 - 切换楼层动画
  map; // 初始化map类 - 每一层中的所有元素
  animateFloor; // TrackFloor类 - 上下楼动画

  init() {
    const CAM_POS = new THREE.Vector3(700, 450, 1100);
    Basic.scene = new THREE.Scene();
    // 调整整体位置
    // Basic.mainGroup.position.y = 0
    // Basic.mainGroup.position.z = -30

    Basic.camera = new THREE.PerspectiveCamera(
      30,
      this.width / this.height,
      1,
      10000
    );
    Basic.camera.position.set(CAM_POS.x, CAM_POS.y, CAM_POS.z);
    Basic.camera.userData.position = CAM_POS; // 备份相机初始位置值

    Basic.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    Basic.renderer.setSize(this.width, this.height);
    Basic.renderer.setPixelRatio(window.devicePixelRatio); // 设置屏幕像素比，防止在不同显示屏上模糊
    this.container.appendChild(Basic.renderer.domElement);
    LabelBase.create(this.container);

    this.map = new Map(); // 初始化map类 - 每一层中的所有元素
    this.tweenFloor = new TweenFloor(); // 初始化TweenFloor类 - 切换楼层动画
    this.aabbBox = new AABBBox(Basic.camera);

    this.createControls();
    this.createLight();

    this.createMall(houseData); // 创建商场
    this.animate();

    window.addEventListener("mousedown", event => {
      event.stopPropagation();
      this.onDocumentMouseClick(event);
    }, false)

    window.addEventListener("mousemove", event => {
      this.onDocumentMouseMove(event);
    }, false)

    window.addEventListener("resize", () => {
      this.onWindowResize(event);
    }, false)

    document.getElementById("back").addEventListener("click", () => {
      this.singleToMulti()
    })
  }

  animate() {
    TWEEN.update();

    // let delta = this.clock.getDelta()
    // if (Light.mixer) { Light.mixer.update(delta) }

    // let time = Date.now() * 0.002
    // this.pointLight.animate(time)

    requestAnimationFrame(() => {
      this.animate();
    });
    Basic.controls.update();
    Basic.renderer.render(Basic.scene, Basic.camera);
    LabelBase.renderer.render(Basic.scene, Basic.camera);
  }

  onDocumentMouseClick(event) {
    let raycaster = new Raycaster(
      event,
      Basic.camera,
      Basic.renderer.domElement
    )
    document.body.style.cursor = "default";
    if (Basic.status === "multi") {
      let rayList = Map.planeList;
      raycaster.handleEvent(rayList, intersect => {
        this.multiToSingle(intersect[0]);
      });
    }
  }

  lightStatus = false;
  onDocumentMouseMove(event) {
    let raycaster = new Raycaster(
      event,
      Basic.camera,
      Basic.renderer.domElement
    );
    if (Basic.status === "multi") {
      let rayList = Map.planeList;
      raycaster.handleEvent(
        rayList,
        intersect => {
          if (!this.lightStatus) {
            this.lightStatus = true;
            document.body.style.cursor = "pointer";
          }
        },
        () => {
          if (this.lightStatus) {
            this.lightStatus = false;
            document.body.style.cursor = "default";
          }
        }
      );
    }
  }

  onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    Basic.camera.aspect = width / height;
    Basic.camera.updateProjectionMatrix();
    Basic.renderer.setSize(width, height);
    LabelBase.renderer.setSize(width, height);
  }

  // switch: m - s
  multiToSingle(intersect, name) {
    let basicData = {
      key: "name",
      value: intersect.object.parent.name,
      groupInfo: intersect.object.userData.groupInfo
    };
    this.storeList = [];
    Basic.controls.autoRotate = false;
    // this.pointLight.visible(false)

    Basic.mainGroup.children[basicData.value - 1].children.forEach(mesh => {
      if (mesh.name === "store") {
        this.map.changeMaterial(mesh);
      }
    });

    this.tweenFloor.multiToSingle(basicData, name);
    this.createHeatColorInfo(basicData.value);
  }

  singleToMulti() {
    if (Basic.status === "single") {
      Basic.controls.autoRotate = true;
      // this.pointLight.visible(true)
      Basic.mainGroup.children.forEach(group => {
        group.children.forEach(mesh => {
          if (mesh.name === "store") this.map.changeAllMaterial(mesh);
        });
      });
      this.tweenFloor.singleToMulti();
    }
  }

  createHeatColorInfo(value) {
    Basic.mainGroup.children[value - 1].children.forEach((mesh, key) => {
      if (key % 2 === 0 && mesh.name === "store" && !this._isLogoColumn(mesh)) {
        mesh.material.color = this.setColor(1);
        this.storeList.push(mesh);
        this.bindGateText(mesh, value);
      }
    });
  }

  bindGateText(mesh, floorIndex) {
    let label = Label2d.create("商店名", "gateText", 14);
    let textCoord = getCenterExtraPoint(mesh.geometryAttributeArray);
    let aabb = this.aabbBox.create(textCoord, "商店名");
    if (textCoord) {
      label.position.set(textCoord.cx, 1, -textCoord.cy);
      AABBBox.list.push({ ...aabb });
      label.add(aabb.sprite);
      Basic.mainGroup.children[floorIndex - 1].add(label);
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

  createControls() {
    Basic.controls = new OrbitControls(Basic.camera);
    Basic.controls.screenSpacePanning = true;
    Basic.controls.autoRotate = true;
    Basic.controls.autoRotateSpeed = 0.5;
    Basic.controls.maxDistance = 3000;
    Basic.controls.minDistance = 100;
    Basic.controls.saveState();
    Basic.controls.addEventListener("change", () => {
      this.aabbBox.update(AABBBox.list);
      this.aabbBox.checkCollusion(AABBBox.list);
    });
  }

  createLight() {
    let AmbientLight = new THREE.AmbientLight(0xffffff, 0.2);
    Basic.scene.add(AmbientLight);
    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.9);
    Basic.scene.add(light);
  }

  // 创建商场
  createMall(data) {
    ASYNC.each(
      data,
      (item, cb) => {
        let group = new THREE.Group()
        group.name = item.floor || 1
        group.userData.floor = item.floor || 1
        group.userData.name = item.floor || 1
        group.userData.floorName = item.name
        this.map.loadMap(item, group, cb)
        this.map.loadPlane(item, group)
        this.map.createFloorName(item.name, group)
        Basic.mainGroup.add(group)
      },
      () => {
        Basic.scene.add(Basic.mainGroup)
        this.createLogo()
      }
    );
  }

  createLogo() {
    Basic.mainGroup.children.forEach(group => {
      group.children.forEach(mesh => {
        Logo.collection(mesh, group, "3d");
      });
    });
  }
}

let houseData = house;
let basic = new Basic();
basic.init();
