import * as THREE from "three"
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
/**
 * Create all kinds of Sprite
 * 
 * @class                     Sprite
 * @constructor               init variable
 */
class Sprite {
  /**
    * create text sprite
    * 
    * @param { String } text             text will be filled
    * @param { Number } fontSize         font size
    * @param { Object } extraOption      some extra material option
    * @return { Object }                 sprite mesh
    */
  createText (text, fontSize, extraOption) {
    const depth = 1100                                // camera depth
    const scale = depth * ((1 / 60) * fontSize)       // canvas scale ratio
    // create a canvas
    let canvas = document.createElement('canvas')
    canvas.height = canvas.width = fontSize * 32

    let ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.font = fontSize + "px '微软雅黑'"
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    // create texture
    let texture = new THREE.Texture(canvas)
    texture.needsUpdate = true  // texture matrix can be manual update

    // create text sprite object
    let option = Object.assign({
      map: texture,
      transparent: true, 
      depthTest: false,
    }, extraOption)
    let sprite = this._createSprite(option)
    
    sprite.name = 'floorText'
    sprite.scale.set(scale, scale, scale)
    sprite.position.set(-291, 10, 0)
    return sprite
  }

  getTexture (picUrl) {
    let map = new THREE.TextureLoader().load(picUrl)
    return map
  }

  /**
    * create text sprite
    * 
    * @param { String } picUrl             pictrue will be load
    * @param { Object } extraOption        some extra material option
    * @return { Object }                   sprite mesh
    */
  createPic (picUrl, scale, extraOption, name = 'flag') {
    if (!extraOption) {
      extraOption = {opacity: 1}
    }    
    let option = Object.assign({
      map: this.getTexture(picUrl),
      transparent:true,
      opacity:true,
      alphaTest: 0.5,
      // sizeAttenuation: false,
    }, extraOption)
    let sprite = this._createSprite(option)
    
    sprite.name = name
    sprite.scale.set(scale.x, scale.y, scale.z)
    sprite.position.set(0, 10, 0)
    
    return sprite
  }

  createPic2 (text) {
    var earthDiv = document.createElement('div')
    earthDiv.className = 'label'
    earthDiv.textContent = text
    earthDiv.style.position = 'absolute'
    earthDiv.style.top = '0px'
    earthDiv.style.color = '#ffffff'
    earthDiv.style.fontSize = 14 + 'px'
    var earthLabel = new CSS2DObject(earthDiv)
    earthLabel.name = 'logo'
    earthLabel.position.z = 12
    return earthLabel
  }

  createLabel (context, name, fontSize) {
    var earthDiv = document.createElement('div')
    earthDiv.className = 'label'
    earthDiv.textContent = context
    earthDiv.style.position = 'absolute'
    earthDiv.style.top = '0px'
    earthDiv.style.color = '#ffffff'
    earthDiv.style.fontSize = 14 + 'px'
    var earthLabel = new CSS2DObject(earthDiv)
    earthLabel.name = name
    earthLabel.position.z = 12
    return earthLabel
  }

  /**
    * create general sprite
    * 
    * @param { Object } obj              material Option
    * @return { 3dObject }               material Object
    */
  _createSprite (obj) {
    let material = new THREE.SpriteMaterial(obj)
    let sprite = new THREE.Sprite(material)
    return sprite
  }
}

export default Sprite