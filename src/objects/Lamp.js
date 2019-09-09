import * as THREE from "three"
class Lamp {
  constructor (group) {
    this.group = group
  }
  // 暖光
  ambient (strength) {
    const AmbientLight = new THREE.AmbientLight(0xffffff, strength)
    this.group.add(AmbientLight)
  }
  // 天光
  hemisphereLight(strength) {
    const HemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, strength)
    this.group.add(HemisphereLight)
  }
}
export default Lamp