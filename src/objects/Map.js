const THREE = require('three')
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader'
import Sprite from './Sprite'

const scienceVertex = `
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
  vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
  vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const scienceFragment = `
uniform vec3 glowColor;
uniform float b;
uniform float p;
uniform float s;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
 float a = pow( b + 0.6 + s * abs(dot(vNormal, vPositionNormal)), p );
// float a = pow(1.0 + dot(vNormal, vPositionNormal), p);
// if(a > 0.65){ a = 0.4;}
// if(a > 0.1 && a < 0.5){a = 0.5;}
// if(a > 0.65 && a < 0.8){a = 0.6;}
 gl_FragColor = vec4( glowColor, a );
}
`

class Map {
  
  static planeList = []
  
  constructor() {
    this.loader = new SVGLoader()
  }

  // 创建几何体
  createGeometry() {
    return new THREE.Geometry()
  }

  // 创建拉伸几何体
  createExtrudeGeometry(shape) {
    return new THREE.ExtrudeBufferGeometry(shape, {
      depth: 5,
      bevelEnabled: false,
      bevelThickness: 1.5,
	    bevelSize: 1,
	    bevelSegments: 5
    })
  }

  // 创建材质
  createMaterial(options) {
    return new THREE.MeshPhongMaterial(options)
  }

  // 创建网格
  createMesh(shape, options, name, isScience) {
    let geo = this.createGeometry()
    let geoPlane = new THREE.ShapeBufferGeometry(shape)
    let extrudeGeo = this.createExtrudeGeometry(shape)
    geo.fromBufferGeometry(extrudeGeo)
    geo.translate(-290, -214, 0)
    let mat
    if (isScience) {
      mat = new THREE.ShaderMaterial({
        uniforms: { 
          "s": { type: "f", value: -2.0},
          "b": { type: "f", value: 0.6},
          "p": { type: "f", value: 1.0 },
          glowColor: { type: "c", value: options.color }
        },
        vertexShader:   scienceVertex,
        fragmentShader: scienceFragment,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      })
    } else {
      mat = this.createMaterial(options, name)
    }
    let mesh = new THREE.Mesh(geo, mat)
    mesh.geometryAttribute = [].slice.call(geoPlane.attributes.position.array).toString()
    mesh.geometryAttributeArray = geoPlane.attributes.position.array
    mesh.color = options.color
    mesh.name = name
    if (isScience) {
      mesh.userData.color = {
        r: options.color.r,
        g: options.color.g,
        b: options.color.b
      }
    }
    return mesh
  }

  changeMaterial (mesh) {
    let material = new THREE.MeshPhongMaterial({
      color: mesh.pathColor,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      side: THREE.FrontSide
    })
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh){
        child.material = material;
      }
      mesh.geometry.uvsNeedUpdate = true;
      mesh.needsUpdate = true;
    })
  }

  changeAllMaterial (mesh) {
    let material = new THREE.ShaderMaterial({
      uniforms: { 
        "s": { type: "f", value: -2.0},
        "b": { type: "f", value: 0.6},
        "p": { type: "f", value: 1.0 },
        glowColor: { type: "c", value: mesh.color }
      },
      vertexShader:   scienceVertex,
      fragmentShader: scienceFragment,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    })
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh){
        child.material = material;
      }
      mesh.geometry.uvsNeedUpdate = true;
      mesh.needsUpdate=true;
    })
  }

  initTemplate(url, callback, asyncCb = () => {}) {
    this.loader.load(url, data => {
      let paths = data.paths
      paths.forEach(path => {
        let shapes = path.toShapes(true)
        shapes.forEach(shape => {
          callback(path, shape)
        })
      })
      asyncCb(null)
    })
  }


  loadMap(item, group, callback) {
    const originPosition = (item.floor - 2) * 140 - 60
    const isScience = true
    this.initTemplate(item.url, (path, shape) => {
      const options = {
        color: path.color,
        transparent: true,
        depthTest: true,
        depthWrite: true,
        side: THREE.FrontSide
      }
      let mesh = this.createMesh(shape, options, 'store', isScience)
      mesh.rotation.set(0.5 * Math.PI, 0, 0)
      mesh.userData.originPosition = originPosition
      mesh.pathColor = path.color
      if(!isScience) {
        mesh.userData.color = {
          r: mesh.material.color.r,
          g: mesh.material.color.g,
          b: mesh.material.color.b
        }
      }
      // storeList.push(mesh)
      group.add(mesh)
    }, callback)
    group.position.y = originPosition
  }

  loadSingleMap (floorInfo, group, cb) {
    const originPosition = 0
    this.initTemplate(floorInfo.url, (path, shape) => {
      const options = {
        color: '#626c9a',
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      }
      const mesh = this.createMesh(shape, options, 'store')
      mesh.scale.y = -1
      mesh.userData.originPosition = originPosition
      mesh.userData.color = {
        r: mesh.material.color.r,
        g: mesh.material.color.g,
        b: mesh.material.color.b
      }
      cb(mesh, path.color)
      group.add(mesh)
    }) 
  }

  loadTrailMap (item, group, cb, callback) {
    const originPosition = (item.floor - 2) * 120 - 60
    this.initTemplate(floorInfo.url, (path, shape) => {
      const options = {
        color: path.color,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      }
      const mesh = this.createMesh(shape, options, 'store')
      mesh.rotation.set(0.5 * Math.PI, 0, 0)
      mesh.userData.originPosition = originPosition
      mesh.userData.color = {
        r: mesh.material.color.r,
        g: mesh.material.color.g,
        b: mesh.material.color.b
      }
      cb(mesh, path.color)
      group.add(mesh)
    }, callback)
    group.position.y = originPosition
  }

  // board
  loadPlane(item, group) {
    const originPosition = (item.floor - 2) * 140 - 65
    let url = item.mapBaseboard || './static/bottom2.svg'
    group.userData.positionY = originPosition
    group.userData.positionZ = group.position.z
    this.initTemplate(url, (path, shape) => {
      const options = {
        color: '#1a425e',
        transparent: true,
        depthTest: true,
        depthWrite: true,
        opacity: 0.3
      }

      let mesh = this.createMesh(shape, options, 'plane')
      mesh.rotation.set(0.5 * Math.PI, 0, 0)
      mesh.position.y = -5
      mesh.userData = {
        originPosition: originPosition,
        groupInfo: item
      }
      group.userData.groupInfo = item
      Map.planeList.push(mesh)
      group.add(mesh)
    })
  }
  
  loadSinglePlane (floorInfo, group, cb) {
    let url = floorInfo.mapBaseboard || './static/bottom2.svg'
    this.initTemplate(url, (path, shape) => {
      const options = {
        color: '#1a425e',
        transparent: true,
        opacity: 0.3
      }
      let mesh = this.createMesh(shape, options, 'plane')
      mesh.scale.set(1, -1, 1)
      mesh.position.z = -5
      mesh.userData = { groupInfo: floorInfo }
      Map.planeList.push(mesh)
      group.add(mesh)
      options.opacity ? group.userData.isShow = true : group.userData.isShow = false
    })
  }

  static trailPlaneList = []
  loadTrailPlane (item, group, planeList) {
    const originPosition = (item.floor - 2) * 120 - 65
    group.userData.positionY = originPosition
    group.userData.positionZ = group.position.z
    this.initTemplate(item.mapBaseboard, (path, shape) => {
      const options = {
        color: '#1a425e',
        transparent: true,
        // opacity: 0.3
        opacity: 0.3
      }

      let mesh = this.createMesh(shape, options, 'plane')
      mesh.rotation.set(0.5 * Math.PI, 0, 0)
      mesh.position.y = -5
      mesh.userData = {
        originPosition: originPosition,
        groupInfo: item
      }
      planeList.push(mesh)
      group.add(mesh)
      options.opacity ? (group.userData.isShow = true) : (group.userData.isShow = false)
    })
  }


  // gate sprite
  createGateLogo(logo, group) {
    const sprite = new Sprite()
    const option = { opacity: 0 }
    const scale = new THREE.Vector3(20, 12, 15)
    let mesh = sprite.createPic(logo, scale, option)
    group.add(mesh)
  }

  // text sprite
  createFloorName(name, group) {
    const fontSize = 30
    let sprite = new Sprite()
    let option = { opacity: 1 }
    let mesh = sprite.createText(name, fontSize, option)
    group.add(mesh)
  }
}

export default Map;