import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

class LabelBase {
  static renderer
  static create(container) {
    LabelBase.renderer = new CSS2DRenderer()
    LabelBase.renderer.setSize(window.innerWidth, window.innerHeight)
    LabelBase.renderer.domElement.style.position = 'absolute';
    LabelBase.renderer.domElement.style.top = 0;
    container.appendChild(LabelBase.renderer.domElement)
  }
}
export default LabelBase