class MapStyle {
  constructor(mode) {
    this.mode = mode
    this.setButtonUl()
  }
  
  setButtonUl(){
    let buttonUl = document.getElementById('button-ul')
    if (this.mode) {
      // 社群
      buttonUl.style.position = 'absolute'
      buttonUl.style.left = '40px'
      buttonUl.style.top = '27%'
      buttonUl.setAttribute('class', 'associate')
    } else {
      // 首页
      // buttonUl.style.position = 'absolute'
      buttonUl.style.width = '100%'
      buttonUl.style.marginTop = '30px'
      buttonUl.style.marginBottom = '20px'
      buttonUl.style.textAlign = 'center'
      buttonUl.setAttribute('class', 'home')
    }
  }
}
export default MapStyle