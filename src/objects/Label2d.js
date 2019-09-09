import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
class Label2d {
  static arr = []
  static create (context, name, fontSize) {
    
    let labelDiv = document.createElement('div')
    labelDiv.className = 'label'
    labelDiv.textContent = context
    labelDiv.style.position = 'absolute'
    labelDiv.style.top = '0px'
    labelDiv.style.color = '#ffffff'
    labelDiv.style.fontSize = fontSize + 'px'
    
    let label = new CSS2DObject(labelDiv)
    label.name = name
    label.position.z = 12
    
    Label2d.arr.push(label)
    return label
  }

  static clear (group) {
    Label2d.arr.forEach(text => {
      group.remove(text)      
    })
    Label2d.arr = []
  }
}

export default Label2d
