import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
const vertexShader = `
uniform sampler2D heightMap;
uniform float heightRatio;
varying vec2 vUv;
varying float hValue;
varying vec3 cl;
void main() {
  vUv = uv;
  vec3 pos = position;
  cl = texture2D(heightMap, vUv).rgb;
  hValue = texture2D(heightMap, vUv).r;
  pos.y = 2. * heightRatio;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
`;

const fragmentShader = `
varying float hValue;
varying vec3 cl;
void main() {
  float v = abs(hValue - .9);
  gl_FragColor = vec4(cl, .8 - v * v) ;
}
`;
var geometry, material, mesh, texture;

class Light {
  constructor(group) {
    this.group = group;
  }

  ambient() {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    this.group.add(ambientLight);
  }
}

class HeatMap {
  width = window.innerWidth;
  height = window.innerHeight;
  container = document.body;

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      10000
    );
    this.camera.position.set(0, 1000, 0);
    this.scene.add(this.camera);
    this.group = new THREE.Group();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)

    this.light = new Light(this.scene);
    this.light.ambient();

    this.control = this.createControls();
    window.addEventListener("resize", () => {
      this.onWindowResize();
    }, false);

    let promise = new Promise(resolve => {
      this.loadSvg()
      resolve()  
    })
    promise.then(() => { this.initHeatMap() })

    this.animate()
  }

  getRandom(max, min) {
    return Math.round((Math.random() * (max - min + 1) + min) * 10) / 10;
  }

  loadSvg() {
    var loader = new SVGLoader()
    loader.load("./static/svg/mall/B1.svg",
      (data) => {
        var paths = data.paths;
        
        for (var i = 0; i < paths.length; i++) {
          var path = paths[i];
          var material = new THREE.MeshBasicMaterial({
            color: path.color,
            side: THREE.DoubleSide,
            // depthWrite: false
          });
          var shapes = path.toShapes(true);
          for (var j = 0; j < shapes.length; j++) {
            var shape = shapes[j];
            // var geometry = new THREE.ShapeBufferGeometry(shape);
            var geometry = new THREE.ExtrudeBufferGeometry(shape, {
              depth: 5,
              bevelEnabled: false,
              bevelThickness: 1.5,
              bevelSize: 1,
              bevelSegments: 5
            })
            // geometry.rotateX(Math.PI * -0.5);
            geometry.translate(-290, -214, 0)
            var mesh = new THREE.Mesh(geometry, material);
            mesh.scale.y = -1
            mesh.rotation.set(0.5 * Math.PI, 0, 0)
            // mesh.position.x = -291
            // mesh.position.y = 214
            this.group.add(mesh);
          }
        }
        this.scene.add(this.group);
      }
    );
  }

  initHeatMap() {
    var heatmap = h337.create({
      container: document.getElementById("heatmap-canvas"),
      width: 256,
      height: 256,
      blur: ".8",
      radius: 10
    });
    var i = 0,
      max = 10,
      data = [];
    while (i < 600) {
      data.push({
        x: this.getRandom(1, 256),
        y: this.getRandom(1, 256),
        value: this.getRandom(1, 10)
      })
      i++;
    }

    heatmap.setData({
      max: max,
      data: data
    });
    texture = new THREE.Texture(heatmap._renderer.canvas);
    geometry = new THREE.PlaneBufferGeometry(480, 308, 1000, 1000);
    geometry.rotateX(Math.PI * -0.5);
    material = new THREE.ShaderMaterial({
      uniforms: {
        heightMap: { value: texture },
        heightRatio: { value: 1 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 5
    // mesh.rotation.x = 0.5 * Math.PI
    this.group.add(mesh);
  }

  createControls() {
    return new OrbitControls(this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    if (texture) texture.needsUpdate = true
    requestAnimationFrame(() => { this.animate() })
    this.renderer.render(this.scene, this.camera)
  }
}

let heat = new HeatMap();
heat.init();
