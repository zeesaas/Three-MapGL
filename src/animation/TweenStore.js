const TWEEN = require('@tweenjs/tween.js')

class TweenStore {
  static enter (mesh) {
    let start = { 
      scale: 1, 
      opacity: 1, 
      opacityPlane: 0.3, 
      opacityStore: 0.1 
    }
    let end = {
      scale: 1.1,
      opacity: 0.1,
      opacityPlane: 0.1,
      opacityStore: 1
    }
    let action = new TWEEN.Tween(start).to(end, 500).onUpdate(() => {
      mesh.scale.x = start.scale
      mesh.scale.y = start.scale
      mesh.scale.z = start.scale
      if (mesh.material.opacity <= 0.98) {
        mesh.material.opacity = start.opacityStore
      }
      mesh.parent.children.forEach(mesh => {
        if (!mesh.isSingle) {
          if (mesh.name === 'plane') {
            mesh.material.opacity = start.opacityPlane
          } else if (
            mesh.name !== 'plane' && 
            mesh.name !== 'gateText' && 
            mesh.name !== '2dLogo'
          ){
            mesh.material.opacity = start.opacity
          }
        }
      })
    })
    action.start()
  }

  static leave (item) {
    let start = { scale: 1.1, opacity: 1}
    let end = { scale: 1, opacity: 0.1}
    let action = new TWEEN.Tween(start).to(end, 500).onUpdate(() => {
      item.scale.x = start.scale
      item.scale.y = start.scale
      item.scale.z = start.scale
      item.material.opacity = start.opacity
    })
    action.start()
  }
}

export default TweenStore