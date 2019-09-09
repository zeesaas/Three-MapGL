const THREE = require('three')
class AABBBox {
  scale = { x: 50, y: 30, h: 6 }

  static list = []

  constructor (camera) {
    this.camera = camera
  }

  // 计算精灵box3
  create (coord, name) {
    const labelSprite = this._createLabelSprite(name)
    const spriteBox = new THREE.Box3().setFromObject(labelSprite)
    let max = new THREE.Vector3(
      coord.cx + spriteBox.max.x * this.scale.x,
      coord.cy + spriteBox.max.y * this.scale.y,
      0
    )
    let min = new THREE.Vector3(
      coord.cx + spriteBox.min.x * this.scale.x,
      coord.cy + spriteBox.min.y * this.scale.y,
      0
    )
    let worldSpriteBox = new THREE.Box3(min, max)
    return {
      box: worldSpriteBox,
      sprite: labelSprite
    }
  }

  update () {
    for (let i = 0; i < AABBBox.list.length; i++) {
      let textBoxTemp = new THREE.Box3().setFromObject(AABBBox.list[i].sprite)
      let max = new THREE.Vector3(textBoxTemp.max.x, textBoxTemp.max.y, 0)
      let min = new THREE.Vector3(textBoxTemp.min.x, textBoxTemp.min.y, 0)
      let textBox3 = new THREE.Box3(min, max)
      AABBBox.list[i].box = textBox3
    }
  }

  // 创建完全覆盖文字的精灵盒子
  _createLabelSprite (name) {
    let camera = this.camera
    // 模拟深度衰减
    let onBeforeRender = () => {
      const v = new THREE.Vector3()
      const v1 = new THREE.Vector3()
      if (!camera) return
      return function onBeforeRender () {
        const factor = 0.05
        // 矩阵转换为方向向量
        v.setFromMatrixPosition(this.matrixWorld)
        v1.setFromMatrixPosition(camera.matrixWorld)
        const f = v.sub(v1).length() * factor
        this.scale.x = this.userData.originScale.x * f
        this.scale.y = this.userData.originScale.y * f
      }
    }

    // 创建精灵
    const width = this.getTextWidth(name)
    const scaleRatio = parseInt(width / 2.5)
    const spriteMaterial = new THREE.SpriteMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      alphaTest: 0.5
    })
    let sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(scaleRatio / this.scale.x, this.scale.h / this.scale.y, 1)
    sprite.userData.originScale = new THREE.Vector3().copy(sprite.scale)
    sprite.onBeforeRender = onBeforeRender.call(sprite)
    return sprite
  }

  // 统计一段字符串的实际px长度
  getTextWidth (str) {
    let width = 0
    let html = document.createElement('span')
    html.innerText = str
    html.className = 'getTextWidth'
    document.querySelector('body').appendChild(html)
    width = document.querySelector('.getTextWidth').offsetWidth
    document.querySelector('.getTextWidth').remove()
    return width
  }

  // 检测碰撞
  checkCollusion () {
    for (let i = 0; i < AABBBox.list.length - 1; i++) {
      for (let j = i + 1; j < AABBBox.list.length; j++) {
        if(this._isAABBRect(AABBBox.list[i].box, AABBBox.list[j].box)) {
          AABBBox.list[i].sprite.parent.element.style.opacity = 0
          break
        }else {
          AABBBox.list[i].sprite.parent.element.style.opacity = 1
        }
      }
    }
  }

  // AABB计算法
  _isAABBRect (box1, box2) {
    let x1 = box1.max.x, 
      y1 = box1.min.y, 
      w1 = Math.abs(box1.max.x - box1.min.x), 
      h1 = Math.abs(box1.max.y - box1.min.y)
    
    let x2 = box2.max.x, 
      y2 = box2.min.y, 
      w2 = Math.abs(box2.max.x - box2.min.x), 
      h2 = Math.abs(box2.max.y - box2.min.y)

    if (x1 >= x2 && x1 >= x2 + w2) {
      return false
    } else if (x1 <= x2 && x1 + w1 <= x2) {
      return false
    } else if (y1 >= y2 && y1 >= y2 + h2) {
      return false
    } else if (y1 <= y2 && y1 + h1 <= y2) {
      return false
    }else{
      return true
    }
  }
}

export default AABBBox