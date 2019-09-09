import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

class LabelBase {
  static renderer
  static create(container) {
    LabelBase.renderer = new CSS2DRenderer()
    LabelBase.renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(LabelBase.renderer.domElement)
  }
}
export default LabelBase