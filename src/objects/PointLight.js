const THREE = require('three')
export default class PointLight {

  static list = []

  constructor(count){
    this.count = count
  }

  create (scene) {
    const sphere = new THREE.SphereBufferGeometry(3, 16, 8)
    const colorArr = [
      {color: 0xff0040, strength: 10},
      {color: 0x0040ff, strength: 10},
      {color: 0x28c0b1, strength: 2},
      {color: 0xea9d49, strength: 5}
    ]
    for (let i = 0; i < this.count; i++) {
      let index = i >= 4 ? (i + 1) % 4 : i
      let light = this.single(sphere, colorArr[index].color, colorArr[index].strength)
      PointLight.list.push(light)
      scene.add(light)
    }
  }

  single (sphere, color, strength) {
    const arr = [0.7, 0.5, 0.3]
    const angleArr = ['sin', 'cos']
    let light = new THREE.PointLight(color, strength, 500)
    light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3
    })))
    light.height = this.count * 75
    light.animateVector = {
      x: {
        ratio: arr[Math.floor(Math.random()*3)], 
        inching: angleArr[Math.floor(Math.random()*2)]
      },
      y: {
        ratio: arr[Math.floor(Math.random()*3)],
        inching: angleArr[Math.floor(Math.random()*2)]
      },
      z: {
        ratio: arr[Math.floor(Math.random()*3)],
        inching: angleArr[Math.floor(Math.random()*2)]
      }
    }
    return light
  }

  visible (isVisible) {
    PointLight.list.forEach(light => {
      light.visible = isVisible
    })
  }

  animate (time) {
    time /= this.count
    let option = {
      'sin': (ratio) => Math.sin(time * ratio),
      'cos': (ratio) => Math.cos(time * ratio)
    }
    PointLight.list.forEach(light => {
      light.position.x = option[light.animateVector.x.inching](light.animateVector.x.ratio) * 291
      light.position.y = option[light.animateVector.y.inching](light.animateVector.y.ratio) * light.height
      light.position.z = option[light.animateVector.z.inching](light.animateVector.z.ratio) * 214
    })
  }
}