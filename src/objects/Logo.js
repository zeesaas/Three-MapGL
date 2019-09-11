const THREE = require('three')
import { getCenterExtraPoint } from '../utils'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import {LOGO} from '../constants'

class Logo {
  static arr = []

  static collection (mesh, group, type) {
    if (mesh.name === 'store') {
      let center = getCenterExtraPoint(mesh.geometryAttributeArray)
      let color = mesh.userData.color.r * 255 || path.color.r * 255
      console.log(mesh, color)
      switch (color) {
        case 44:
          Logo[`create${type}`](group, LOGO.ELE, center)
          break
        case 45:
          Logo[`create${type}`](group, LOGO.FELE, center)
          break
        case 46:
          Logo[`create${type}`](group, LOGO.TOL, center)
          break
      }
    }
  }

  static create3d(group, url, center) {
    let scale = 10
    let texture = new THREE.TextureLoader().load(url)
    let material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 })
    let logo = new THREE.Sprite(material)
    logo.name = 'logo'
    logo.scale.set(scale, scale, scale)
    logo.position.set(center.cx, 10, -center.cy)
    logo.url = url
    group.add(logo)
    Logo.arr.push(logo)
  }

  static create2d (group, url, center) {
    let logoDiv = document.createElement('img')
    logoDiv.className = 'imgLabel'
    logoDiv.src = url
    logoDiv.style.position = 'absolute'
    logoDiv.style.top = '0px'
    logoDiv.style.width = '13px'
    logoDiv.style.height = '13px'
    let logo = new CSS2DObject(logoDiv)
    logo.name = '2dLogo'
    logo.position.set(center.cx, center.cy, 10)
    Logo.arr.push(logo)
    group.add(logo)
  }

  static clear (group) {
    Logo.arr.forEach(mesh => { group.remove(mesh) })
    Logo.arr = []
  }
}

export default Logo