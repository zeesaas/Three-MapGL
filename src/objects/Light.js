const THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')
class Light {
  static mixer
  constructor() {}

  static point(camera, radius, outRadius, size) {
    let vertex = `
    uniform vec3 viewVector;
    varying float intensity;
    void main() {
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
      vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
      intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
    }`

    let fragment = `
    varying float intensity;
    void main() {
      vec3 glow = vec3(0, 1, 0) * intensity;
      gl_FragColor = vec4( glow, 1 );
    }`

    let geometry = new THREE.SphereGeometry(radius, 32, 32)
    let material = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    })
    let glowPoint = new THREE.Mesh(geometry, material)

    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        viewVector: {
          type: 'v3',
          value: camera.position
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.1
    })
    let glowGeometry = new THREE.SphereGeometry(outRadius, size, size)
    let glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    glowPoint.name = 'shine'
    glowPoint.add(glowMesh)
    glowPoint.glow = glowMesh

    return glowPoint
  }

  static shining(Object3D, group) {

    let start = { scale: 3 }
    let startCenter = { scale: 5 }
    let middle = {scale: 3}
    let endCenter = {scale: 5}
    let end = {scale: 3}

    let tweenStart = new TWEEN.Tween(start).to(startCenter, 500)
    let tweenStartCenter = new TWEEN.Tween(startCenter).to(middle, 500)
    let tweenMiddle = new TWEEN.Tween(middle).to(endCenter, 500)
    let tweenEnd = new TWEEN.Tween(endCenter).to(end, 500)

    tweenStart.onUpdate(() => {
      let s = start.scale
      Object3D.scale.set(s, s, s)
    })
    .start()
    .onComplete(() => { tweenStartCenter.start() })

    tweenStartCenter.onUpdate(() => {
      let s = startCenter.scale
      Object3D.scale.set(s, s, s)
    })
    .onComplete(() => { tweenMiddle.start() })

    tweenMiddle.onUpdate(() => {
      let s = middle.scale
      Object3D.scale.set(s, s, s)
    })
    .onComplete(() => {
      tweenEnd.start()
    })

    tweenEnd.onUpdate(() => {
      let s = endCenter.scale
      Object3D.scale.set(s, s, s)
    })
    .onComplete(() => {
      group.remove(Object3D)
    })

  }
}
export default Light
