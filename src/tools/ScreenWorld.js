class ScreenWorld {
  constructor(depth) {
    this.depth = depth
  }
  translate (screenPoint) {
    // 获取屏幕坐标投影在相机上的x和y轴的值
    console.log(window.innerWidth)
    let pX = (screenPoint.x / window.innerWidth) * 2 - 1
    let pY = -(screenPoint.y / window.innerHeight) * 2 + 1
    // let p = new THREE.Vector3(pX, pY, -1).unproject(camera);
    // set vector2
    // let p2 = new THREE.Vector2(pX, pY);
    // get z-depth
    
    // let zd = ComWorld.camera.position.z - 10
    let zd = this.depth - 10
    // get camera angle (180-30)/2
    let za = (180 - 30) / 2 * Math.PI / 180
    // 获取世界坐标中的x轴边界
    let bx = (zd / Math.tan(za)) * (window.innerWidth / window.innerHeight)
    // 获取世界坐标中的y轴边界
    let by = zd / Math.tan(za)
    // 获取世界坐标中x轴的实际坐标点
    let sx = pX * bx
    // 获取世界坐标中y轴的实际坐标点
    let sy = pY * by

    return {
      x: sx,
      y: sy
    }
  }
}

export default ScreenWorld