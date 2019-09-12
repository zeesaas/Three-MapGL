const ASYNC = require("async");
const THREE = require("three");
const TWEEN = require("@tweenjs/tween.js");

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Map from "../objects/Map";
import Logo from "../objects/Logo";
import Raycaster from "../objects/Raycaster";
import LabelBase from "../objects/LabelBase";
import { house } from "../../model/home";
import AABBBox from "../objects/AABBBox"; // AABB盒子类
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';


export default class AfterImage {
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
    AfterImage.scene = new THREE.Scene();
    // 调整整体位置

    AfterImage.camera = new THREE.PerspectiveCamera( 30, this.width / this.height, 1, 10000 );
    AfterImage.camera.position.set(CAM_POS.x, CAM_POS.y, CAM_POS.z);
    AfterImage.camera.userData.position = CAM_POS; // 备份相机初始位置值

    AfterImage.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    AfterImage.renderer.setSize(this.width, this.height);
    AfterImage.renderer.setPixelRatio(window.devicePixelRatio); // 设置屏幕像素比，防止在不同显示屏上模糊
    this.container.appendChild(AfterImage.renderer.domElement);
    LabelBase.create(this.container);

    this.map = new Map(); // 初始化map类 - 每一层中的所有元素
    this.aabbBox = new AABBBox(AfterImage.camera);

    this.createControls();
    this.createLight();

    this.composer = new EffectComposer( AfterImage.renderer );
    this.composer.addPass( new RenderPass( AfterImage.scene, AfterImage.camera ));
    
    this.afterimagePass = new AfterimagePass();
    this.composer.addPass( this.afterimagePass );
    this.afterimagePass.uniforms[ "damp" ].value = 0.9

    this.fxaaPass = new ShaderPass( FXAAShader );
    var pixelRatio = AfterImage.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.container.offsetWidth * pixelRatio );
    this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.container.offsetHeight * pixelRatio );
    this.composer.addPass( this.fxaaPass );

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

    requestAnimationFrame(() => {
      this.animate();
    });
    AfterImage.controls.update();
    this.composer.render();
    LabelBase.renderer.render(AfterImage.scene, AfterImage.camera);
  }

  onDocumentMouseClick(event) {
    let raycaster = new Raycaster(
      event,
      AfterImage.camera,
      AfterImage.renderer.domElement
    )
    document.body.style.cursor = "default";
    if (AfterImage.status === "multi") {
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
      AfterImage.camera,
      AfterImage.renderer.domElement
    );
    if (AfterImage.status === "multi") {
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
    AfterImage.camera.aspect = width / height;
    AfterImage.camera.updateProjectionMatrix();
    AfterImage.renderer.setSize(width, height);
    LabelBase.renderer.setSize(width, height);
  }

  createControls() {
    AfterImage.controls = new OrbitControls(AfterImage.camera);
    AfterImage.controls.screenSpacePanning = true;
    AfterImage.controls.autoRotate = true;
    AfterImage.controls.autoRotateSpeed = 0.5;
    AfterImage.controls.maxDistance = 3000;
    AfterImage.controls.minDistance = 100;
    AfterImage.controls.saveState();
    AfterImage.controls.addEventListener("change", () => {
      this.aabbBox.update(AABBBox.list);
      this.aabbBox.checkCollusion(AABBBox.list);
    });
  }

  createLight() {
    let AmbientLight = new THREE.AmbientLight(0xffffff, 0.2);
    AfterImage.scene.add(AmbientLight);
    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.9);
    AfterImage.scene.add(light);
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
        AfterImage.mainGroup.add(group)
      },
      () => {
        AfterImage.scene.add(AfterImage.mainGroup)
        this.createLogo()
      }
    );
  }

  createLogo() {
    AfterImage.mainGroup.children.forEach(group => {
      group.children.forEach(mesh => {
        Logo.collection(mesh, group, "3d");
      });
    });
  }
}

let houseData = house;
let afterimage = new AfterImage();
afterimage.init();

