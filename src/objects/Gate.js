const THREE = require('three')
import ScreenWorld from '../tools/ScreenWorld'
class Gate {
  constructor (group, depth, schrodingerGate) {
    this.group = group
    this.depth = depth
    this.schrodingerGate = schrodingerGate
  }
  create (el, e, spriteList, id) {
    if (e.target && (e.target.nodeName.toUpperCase() === 'IMG')) {
      let src = e.target.src.split('/').pop()
      if (!id) {
        id = e.target.parentNode.getAttribute('data-id')
      }
      let type = parseInt(e.target.parentNode.getAttribute('data-type'))
      let img = el.children[0].children[0]
      let box = document.createElement('img')
      let divX = event.clientX - img.offsetWidth / 2
      let divY = event.clientY - img.offsetHeight / 2

      box.src = `./static/${src}`
      box.style.width = '20px'
      box.style.position = 'absolute'
      box.style.left = divX + 'px'
      box.style.top = divY + 'px'
      document.body.appendChild(box)

      document.onmousemove = (event) => {
        event = event || window.event
        let divX = event.clientX - img.offsetWidth / 2
        let divY = event.clientY - img.offsetHeight / 2
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

          object.position.set(
            newScreen.x, 
            newScreen.y - 10, 
            10
          )

          if (id) {
            data = { coord: newScreen, id: id }
          } else if (type) {
            data = { coord: newScreen, type: type }
          }
          // create gate sprite
          let meshPic = Gate.createRealGate(box.src, data)
          object.add(meshPic)
          meshPic.info = data
          spriteList.push(meshPic)

          this.group.add(object)
          this.schrodingerGate.name = object.name
          this.schrodingerGate.realName = 'gateGroup'
        }
      }
    }
  }

  static createRealGate (src, data, trigger = false) {
    let scale = new THREE.Vector3(12, 7, 8)
    let mesh = Gate.createPic(src, scale)
    mesh.name = 'gate'

    if (!trigger) {
      window.parent.postMessage({
        cmd: 'gate_info',
        data: data
      }, '*')
    }
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