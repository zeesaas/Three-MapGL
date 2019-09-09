class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Contour {
  constructor(points = []) {
    this.pts = points
  }

  // caculate polygon area
  area() {
    let area = 0
    let pts = this.pts
    let nPts = pts.length
    let j = nPts - 1
    let p1, p2

    for (var i = 0; i < nPts; j = i++) {
      p1 = pts[i]
      p2 = pts[j]
      area += p1.x * p2.y
      area -= p1.y * p2.x
    }
    area /= 2;

    return area
  }

  // caculate polygon boundary
  boundary() {
    var pts = this.pts
    var nPts = pts.length
    var t = {}
    var b = {}
    var l = {}
    var r = {}

    for (var i = 0; i < nPts; i++) {
      if (i === 0) {
        t.val = pts[i].y
        t.index = 0
        b.val = pts[i].y
        b.index = 0
        l.val = pts[i].x
        l.index = 0
        r.val = pts[i].x
        r.index = 0
      } else {
        if (pts[i].y > t.val) {
          t.val = pts[i].y
          t.index = i
        }
        if (pts[i].y < b.val) {
          b.val = pts[i].y
          b.index = i
        }
        if (pts[i].x > r.val) {
          r.val = pts[i].x
          r.index = i
        }
        if (pts[i].x < l.val) {
          l.val = pts[i].x
          l.index = i

        }
      }
      return {
        top: [pts[t.index].x, pts[t.index].y],
        right: [pts[r.index].x, pts[r.index].y],
        bottom: [pts[b.index].x, pts[b.index].y],
        left: [pts[l.index].x, pts[l.index].y]
      }
    }
  }
  
  // caculate
  centroid() {
    var pts = this.pts;
    var nPts = pts.length;
    var x = 0;
    var y = 0;
    var f;
    var j = nPts - 1;
    var p1;
    var p2;

    for (var i = 0; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      f = p1.x * p2.y - p2.x * p1.y;
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
    }

    f = this.area() * 6;

    return new Point(x / f, y / f)
  }
}

export default Contour