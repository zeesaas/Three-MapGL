import Contour from './tools/Contour' // 获取中心点

export function changeArrayLevel(array) {
  if (!array) return
  var buffer = []
  var maxLeft = null
  for (var i = 0; i < array.length; i++) {
    var lot = (i + 1) % 3
    if (i && !lot) {
      var items = array.slice(i - 2, i)
      if (maxLeft < items[0]) maxLeft = items[0]
      buffer.push({ x: items[0], y: items[1] })
    }
  }
  return { buffer: buffer, maxLeft: maxLeft }
}

export function subArrayToLength (arr = [], len) {
  let newArray = []
  len = len || 3 * 20
  try {
    if (!Array.isArray(arr)) {
      if (typeof arr === 'string') {
        arr = arr.split(',')
      } else {
        arr = [].slice.call(arr)
      }
    }
    newArray = arr.slice(0, len)
  } catch (error){
    console.error(error)
  }
  return newArray.map(item => parseInt(item, 10)).toString()
}

export function getCenterExtraPoint (array) {
  if (!array) return
  var a = changeArrayLevel(array)
  var ps = new Contour(a.buffer).centroid()
  return {
    rx: a.maxLeft - 291,
    cx: ps.x - 291,
    cy: 214 - ps.y
  }
}

export function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return false
}

export function createLevitateBox (screenAlex) {
  var levitaten = document.getElementById('device__popper--wrap')
  if (screenAlex) {
    var hl = document.getElementsByClassName('horizontal-line')[0]
    var line = document.getElementsByClassName('add-button')[0]
    line.setAttribute('data-visible', false)
    hl.style.width = '0px'
    var wy = screenAlex.y - 172
    var wx = screenAlex.x - 100
    if (wx < 0 ) {
      wx = 0
    }
    if (wy < 0) {
      if ((wx + 114 > screenAlex.x) && 150 > screenAlex.y) {
        hl.style.top = screenAlex.y + 'px'
        hl.style.right = -24 + 'px'
        hl.style.width = 22 + 'px'
        line.setAttribute('data-visible', true)
        wx -= 44
      }
      wy = 0
    }
    levitaten.style.top = wy + 'px'
    levitaten.style.left = wx + 'px'
    levitaten.style.display = 'block'
  } else {
    levitaten.style.display = 'none'
  }
}

export function getRandom(max, min) {
  return Math.round((Math.random() * (max - min + 1) + min) * 10) / 10;
}