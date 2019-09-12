const THREE = require('three')
import ScreenWorld from '../tools/ScreenWorld'
class Gate {
  constructor (group, depth, schrodingerGate) {
    this.group = group
    this.depth = depth
    this.schrodingerGate = schrodingerGate
  }

  create (cb) {

    let box = document.createElement('img')
    

    box.src = `./static/camera-inside.png`
    box.style.width = '20px'
    box.style.position = 'absolute'
    let divX = event.clientX - box.offsetWidth / 2
    let divY = event.clientY - box.offsetHeight / 2
    box.style.left = divX + 'px'
    box.style.top = divY + 'px'
    document.body.appendChild(box)

    document.onmousemove = (event) => {
      event = event || window.event
      let divX = event.clientX - box.offsetWidth / 2
      let divY = event.clientY - box.offsetHeight / 2
      box.style.left = divX + 'px'
      box.style.top = divY + 'px'
    }

    box.onmousedown = (event) => {
      event = event || window.event
      document.onmousemove = null
      document.body.removeChild(box)
      let screenWorld = new ScreenWorld(this.depth)
      let newScreen = screenWorld.translate({
        x: event.clientX,
        y: event.clientY
      })
      if (Math.abs(newScreen.x) < 291 && 
          Math.abs(newScreen.y) < 214) {
        let data = {}
        let object = new THREE.Object3D()
        object.name = 'schrodingerName'
        
        // create gate sprite
        let meshPic = Gate.createRealGate(box.src, 'schrodingerName')
        object.add(meshPic)
        this.group.add(object)
        cb(object)
      }
    }
  }

  static createRealGate (src, name = 'gate') {
    let scale = new THREE.Vector3(12, 7, 8)
    let mesh = Gate.createPic(src, scale)
    mesh.name = name
    return mesh
  }

  static createPic (picUrl, scale, extraOption, name = 'flag') {
    if (!extraOption) {
      extraOption = {opacity: 1}
    }
    let material = new THREE.SpriteMaterial(Object.assign({
      map: new THREE.TextureLoader().load(picUrl),
      transparent:true,
      opacity:true,
      alphaTest: 0.5
    }, extraOption))
    let sprite = new THREE.Sprite(material)
    sprite.name = name
    sprite.scale.set(scale.x, scale.y, scale.z)
    sprite.position.set(0, 10, 0)
    
    return sprite
  }

  static cancel (type, group, schrodingerGate) {
    let gate = group.getObjectByName(schrodingerGate.name)
    
    if (!type) {
      group.remove(gate)
    } else {
      gate.name = schrodingerGate.realName
    }
    gate = {}
  }

  static gateDom () {
    let gateList = document.getElementById('gateList')
  }
}

export default Gate