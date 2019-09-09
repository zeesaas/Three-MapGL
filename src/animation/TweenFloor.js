import World from '../scene/home'
import Label2d from '../objects/Label2d'
const THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')
/**
 * change single and multi by some tween, and bind some status at group's userData
 * 
 * @class
 * @param { Number } mode
 * @paramDesc mode
 */
class TweenFloor {
  constructor () {
    this.options = this._getTweenValue()
    this.rotationX = -0.18 * Math.PI
  }

  singleToMulti () {
    World.status = 'multi'

    World.mainGroup.children.forEach(group => {
      if (group.visible) {
        this._postMessage(0)
        Label2d.clear(group)

        let position = Object.assign( this.options.cameraCurrent, { cy: group.position.y, rx: this.rotationX })
        let target = Object.assign( this.options.cameraOrigin, { cy: group.userData.positionY, rx: 0 })
        
        group.children.forEach((mesh) => {
          if (mesh.name === 'store') {
            // this.options.setColor(mesh, mesh.userData.color)
          } else if(mesh.name === 'flag') {
            this.options.setOpacity(mesh, 0)
          }
        })
        this._sport(position, target, group, ()=>{
          World.controls.target.copy(World.scene.position)
          World.mainGroup.userData.active = 0
        })
      } else {
        group.visible = true
        group.position.y = group.userData.positionY
        group.position.z = group.userData.positionZ
      }
    })
  }

  multiToSingle (basicData, name) {
    
    let {key, value, groupInfo} = basicData
    let color = { r: 98/255, g: 108/255, b: 154/255 }

    World.status = 'single' // status置为single
    World.mainGroup.userData.visible = value - 1

    // 发送 m-s 信号
    this._postMessage(value, groupInfo, name)
    this._updateControls()
    
    World.mainGroup.children.forEach(group => {
      if (group.userData[key] !== value) {
        group.visible = false
        group.position.y = -100
      } else {
        
        group.children.forEach(mesh => {
          switch (mesh.name) {
            case 'store':
              this.options.setColor(mesh, color)  
              this.options.setOpacity(mesh, 1)
              break;
            case 'plane':
              this.options.setOpacity(mesh, 0.3)
              break;
          }
        })

        let position = Object.assign(this.options.cameraCurrent, { cy: group.position.y, rx: 0 })
        let target = Object.assign(this.options.cameraSport, { cy: 0, rx: this.rotationX})
        this._sport(position, target, group)
      }
    })
  }

  _updateControls() {
    World.controls.target.copy(World.scene.position)
    World.controls.reset()
    World.controls.update()
  }

  singleToSingle (floor) {
    let color = { r: 98/255, g: 108/255, b: 154/255 }

    World.controls.target.copy(World.scene.position)
    World.status = 'single'

    let groupInfo = this._getGroupInfo(parseInt(floor) - 1)
    this._postMessage(floor, groupInfo)

    World.mainGroup.children.forEach(group => {
      group.position.z = 0
      if (group.visible) {
        group.visible = false
        group.position.y = 0
        Label2d.clear(group)
        group.children.forEach(mesh => {
          if (mesh.name === 'store') {
            this.options.setColor(mesh, mesh.userData.color)
          } else if (mesh.name === 'flag') {
            this.options.setOpacity(mesh, 0)
          }
        })
      }
      if (group.userData.floor === floor) {
        group.position.y = 0
        World.mainGroup.userData.visible = floor - 1
        group.visible = true
        group.children.forEach(mesh => {
          if (mesh.name === 'store') {
            this.options.setColor(mesh, color)
          }
          if (mesh.name === 'plane') {
            this.options.setOpacity(mesh, 0.3)
          }
        })
      }
    })
  }

  _postMessage (floor, groupInfo, name) {
    if (groupInfo) name = name || groupInfo.name
    window.parent.postMessage({
      cmd: 'to_single',
      data: floor,
      groupInfo: groupInfo,
      name: name
    }, '*')
  }

  // 场景切换时: 获取每层楼的的groupInfo信息
  _getGroupInfo (floor) {
    let group = World.mainGroup.children[floor]
    let groupInfo = group.userData.groupInfo
    return groupInfo
  }

  // set origin position value
  _getTweenValue () {
    return {
      cameraCurrent: {
        x: World.camera.position.x,
        y: World.camera.position.y,
        z: World.camera.position.z
      },
      cameraOrigin: {
        x: World.camera.userData.position.x,
        y: World.camera.userData.position.y,
        z: World.camera.userData.position.z
      },
      cameraSport: {
        x: World.camera.position.x - 700,
        y: World.camera.position.y + 550,
        z: World.camera.position.z - 1000
      },
      setColor: (mesh, color) => {
        mesh.material.color.r = color.r
        mesh.material.color.g = color.g
        mesh.material.color.b = color.b
      },
      setOpacity: (mesh, opacity) => {
        mesh.material.opacity = opacity
      }
    }
  }

  _sport (position, target, group, complete = ()=>{}) {
    let tween = new TWEEN.Tween(position).to(target, 1500)
    tween.onUpdate(() => {
      World.camera.position.x = position.x
      World.camera.position.y = position.y
      World.camera.position.z = position.z
      group.position.y = position.cy
      World.mainGroup.rotation.x = position.rx
      World.camera.lookAt(new THREE.Vector3(0, 0, 0))
    })
    .onComplete(() => {
      complete()
    })
    .easing(TWEEN.Easing.Linear.None)
    .start()
  }
}

export default TweenFloor
