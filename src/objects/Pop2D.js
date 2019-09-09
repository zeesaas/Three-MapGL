import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer'
class Pop2D {
  label

  create (group) {
    let popDiv = document.createElement('div')
    popDiv.textContent = ''
    popDiv.style.position = 'absolute'
    popDiv.style.top = '0px'
    popDiv.style.color = '#ffffff'
    popDiv.style.fontSize = '12px'
    
    this.label = new CSS2DObject(popDiv)
    this.label.name = 'label'

    this.reset()
    group.add(this.label)
  }

  reset () {
    this.label.position.set(0, 0, 0)
    this.label.element.style.opacity = 0
  }

  moved (name, position) {
    this.label.element.style.opacity = 1
    this.label.element.textContent = name
    this.label.position.x = position.x
    this.label.position.y = position.y + 10
    this.label.position.z = 12
  }
}

export default Pop2D