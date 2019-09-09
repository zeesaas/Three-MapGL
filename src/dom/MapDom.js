class MapDom {
  constructor(mode, data) {
    this.mode = mode
    this.data = data
    this.createPage()
  }

  createPage() {
    this.app = document.getElementById('map')
    this.app.appendChild(MapDom.createButtonUlDom(this.mode, this.data))
    this.app.appendChild(MapDom.createGateDom(this.mode))
    this.app.appendChild(MapDom.createLevitatenDom(this.mode))
    this.app.appendChild(MapDom.createExistGateDom(this.mode))
  }

  static createButtonUlDom(mode, list) {
    let buttonUl = document.createElement('div')
    buttonUl.setAttribute('id', 'button-ul')
    let floor = `
    <% if (mode === 0) { %>
    <a href='javascript:;' id='all' class='active'>总</a>
    <% } %>
    <span id="floor">
    <% for(let i = 0; i < list.length; i++) { %>
      <a data-value='<%= list[i].floor %>'><%= list[i].name %></a>
    <% } %>
    </span>
    <% if (mode === 0 && list.length > 10000) { %>
    <a href='javascript:;' id='upfloor'>上升</a>
    <a href='javascript:;' id='downfloor'>下降</a>
    <% } %>
    <div style="none" id="singleStore"></div>
    `
    let parse = eval(MapDom.compile(floor))
    buttonUl.innerHTML = parse()
    return buttonUl
  }

  static createGateDom (mode) {
    let gateGroup = document.createElement('div')
    gateGroup.setAttribute('id', 'gate-group')

    let item = `
    <% if (mode === 1) { %>
    <div class="gate-item gate-orange" data-type="2">
      <img src="./static/camera-outside.png" alt="">
      <span>外部出入口</span>
    </div>
    <div class="gate-item gate-red" data-type="1">
      <img src="./static/camera-inside.png" alt="">
      <span>内部出入口</span>
    </div>
    <div class="gate-item gate-green" data-type="3">
      <img src="./static/camera-post.png" alt="">
      <span>通道</span>
    </div>
    <% } %>
    `
    let parse = eval(MapDom.compile(item))
    gateGroup.innerHTML = parse()
    return gateGroup
  }

  static createExistGateDom (mode, domString) {
    let existGateGroup = document.createElement('div')
    existGateGroup.setAttribute('id', 'existGate')

    let item = `
    <% if (mode === 1) { %>
      <div class="tip-text">
      </div>
      <div class="gate-list" id="gateList">
      </div>
    <% } %>
    `
    let parse = eval(MapDom.compile(item))
    existGateGroup.innerHTML = parse()
    return existGateGroup
  }

  static createExistGateInner (data) {
    let gateList = document.getElementById('gateList')
    let item = `
      <% for(let i=0; i < data.existGate.length; i++) { %>
        <div class="gate-item gate-red" data-id="<%= data.existGate[i].id %>">
        <% if (data.existGate[i].type === 2) { %>
          <img src="./static/camera-outside.png" alt="" width="14px" height="14px">
        <% } else if (data.existGate[i].type === 1) {%>
          <img src="./static/camera-inside.png" alt="" width="14px" height="14px">
        <% } else if (data.existGate[i].type === 3) {%>
          <img src="./static/camera-post.png" alt="" width="14px" height="14px">
        <% } %>
          <span><%= data.existGate[i].name  %></span>
        </div>
      <% } %>`
    let parse = eval(MapDom.compile(item))
    gateList.innerHTML = parse({ existGate: data })
    return gateList
  }

  static createLevitatenDom () {
    let levitaten = document.createElement('div')
    levitaten.setAttribute('id', 'device__popper--wrap')
    levitaten.setAttribute('class', 'levitaten')

    let context = `
    <div class="title">
      <div class="pull-right">
        <img src="./static/edit_icon2x.png" data-type="editPortal" alt="">
        <img src="./static/delete_icon.png" data-type="deletePortal" alt="">
      </div>
      <div class="pull-left">
        <p id="device--title" class="ellipsis"></p>
      </div>
    </div>
    <div class="device-list-wrap">
      <ul class="device-list" id="device--list">
      </ul>
    </div>
    <div class="add-button">
      <a href="javascript:void (0);" data-type="add">添加设备</a>
    </div>
    <div class="horizontal-line"></div>
    `
    levitaten.innerHTML = context
    return levitaten
  }

  static compile (template) {
    const evalExpr = /<%=(.+?)%>/g
    const expr = /<%([\s\S]+?)%>/g

    template = template.replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`').replace(expr, '`); \n $1 \n  echo(`')

    template = 'echo(`' + template + '`);'

    let script = `(function parse(data){
      let output = "";
      function echo(html){
        output += html;
      }
      ${template}
      return output;
    })`

    return script
  }
}

export default MapDom;
