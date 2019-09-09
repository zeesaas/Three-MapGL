const THREE = require('three')
class Raycaster{

  constructor (event, camera, domElement) {
    this.event = event
    this.raycaster = new THREE.Raycaster()
    this.camera = camera
    this.domElement = domElement
  }

  handleEvent (rayList, callback, emptyCallback = () => {}) {
    const mouse = new THREE.Vector2()
    const container = this.domElement
  
    mouse.x = (this.event.clientX / container.clientWidth) * 2 - 1
    mouse.y = - (this.event.clientY / container.clientHeight) * 2 + 1
    this.raycaster.setFromCamera(mouse, this.camera)
    
    let intersects = this.raycaster.intersectObjects(rayList)
    if (intersects.length > 0) {
      callback(intersects)
    } else {
      emptyCallback()
    }
  }
}

export default Raycaster