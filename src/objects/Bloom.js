const THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')
import Light from './Light'
class Bloom {
  static list = []
  constructor (group) {
    this.mainGroup = group
  }

  createPic (coord, data) {
    const floorIndex = Math.floor(data.floorIndex)
    const group = this.mainGroup.getObjectByName(floorIndex)
    let sprite = this._bloomPicTexture(data.imgUrl)
    sprite.position.set(coord.x, 35, -coord.z)
    sprite.scale.set(25, 25, 1)
    this._bloomPicAnimate(group, sprite)
    group.add(sprite)
  }
  
  createPoint (coord, groupIndex) {
    const floorIndex = Math.floor(groupIndex)
    let group = this.mainGroup.getObjectByName(floorIndex)
    let mesh = this._bloomPointTexture()
    mesh.position.set(coord.x, 10, -coord.z)
    mesh.scale.set(4, 4, 4)
    Bloom.list.push(mesh)
    Light.shining(mesh, group)
    group.add(mesh)
  }

  static clearShine (group) {
    if (Bloom.list.length) {
      Bloom.list.forEach(() => {
        let shine = group.getObjectByName('shine')
        group.remove(shine)
      })
    }
  }

  _bloomPicTexture (url) {
    const texture = new THREE.TextureLoader().load(url)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    })
    const sprite = new THREE.Sprite(material)
    return sprite
  }

  _bloomPointTexture () {
    let texture = new THREE.TextureLoader().load('./static/shining.png')
    let geometry = new THREE.CircleGeometry(5, 32)
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true
    })
    let mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  _bloomPicAnimate (group, sprite) {
    let position = { y: 35 }
    let target = { y: 60 }
    let end = {y: 35}
    let opStart = {opacity: 1}
    let opEnd = {opacity: 0}

    let tween = new TWEEN.Tween(position).to(target, 500)
    tween.onUpdate(function(){
      sprite.position.y = position.y;
    })
    tween.easing(TWEEN.Easing.Bounce.In)
    tween.start();

    let tweenback = new TWEEN.Tween(target).to(end, 500)
    tweenback.onUpdate(function(){
      sprite.position.y = target.y;
    })
    tweenback.easing(TWEEN.Easing.Bounce.Out)

    let tweenOpacity = new TWEEN.Tween(opStart).to(opEnd, 700)
    tweenOpacity.onUpdate(function() {
      sprite.material.opacity = opStart.opacity
    })

    tween.onComplete(() => {
      tweenback.start();
    })
    tweenback.onComplete(() => {
      tweenOpacity.start()
    })
    tweenOpacity.onComplete(() => {
      group.remove(sprite)
    })
  }
}

export default Bloom