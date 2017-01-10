var myCanvas
var myCircle
var mySystem

function setup() {
    myCanvas = new Canvas(1000, 700)
    myCanvas.create()
    myCircle = new Circle(myCanvas.center)
    mySystem = new System(new CollisionDetector(myCanvas, myCircle), myCircle)
    myCircle.velocity.yRate = 10
    myCircle.velocity.xRate = 5
}

function draw() {
    background(255, 0, 200);
    mySystem.render()
}

class System {
    constructor(collisionDetector, circle) {
        this._collisionDetector = collisionDetector
        this._circle = circle
    }

    render() {
        if (this._collisionDetector.anyCollision) {
            if (this._collisionDetector.rightCollision) {
                this._circle.velocity.xRate *= -1
            }

            if(this._collisionDetector.leftCollision){
                this._circle.velocity.xRate *= -1
            }

            if(this._collisionDetector.topCollision){
              this._circle.velocity.yRate *= -1
            }

            if(this._collisionDetector.bottomCollision){
              this._circle.velocity.yRate *= -1
            }
        }

        this._circle.render()
    }
}


class CollisionDetector {
    constructor(canvas, circle) {
        this._canvas = canvas
        this._circle = circle
    }

    get rightCollision() {
        return this._circle.right >= this._canvas.right
    }

    get leftCollision() {
        return this._circle.left <= this._canvas.left
    }

    get topCollision() {
        return this._circle.top >= this._canvas.top
    }

    get bottomCollision() {
        return this._circle.bottom <= this._canvas.bottom
    }

    get anyCollision() {
        return this.bottomCollision || this.topCollision ||
            this.rightCollision || this.leftCollision
    }
}

class Canvas {
    constructor(x, y) {
        this._x = x
        this._y = y
    }

    create() {
        createCanvas(this._x, this._y)
    }

    get center() {
        return new Coordinate(this._x / 2, this._y / 2)
    }

    get top() {
        return this._y
    }

    get bottom() {
        return 0
    }

    get right() {
        return this._x
    }

    get left() {
        return 0
    }
}

class Coordinate {
    constructor(x, y) {
        this._x = x
        this._y = y
    }

    get x() {
        return this._x
    }
    get y() {
        return this._y
    }
    set x(x) {
        this._x = x
    }
    set y(y) {
        this._y = y
    }
}

class Velocity {
    constructor(xRate, yRate) {
        this._xRate = xRate
        this._yRate = yRate
    }

    clear() {
        this._xRate = 0
        this._yRate = 0
    }

    get xRate() {
        return this._xRate
    }
    get yRate() {
        return this._yRate
    }
    set xRate(xRate) {
        this._xRate = xRate
    }
    set yRate(yRate) {
        this._yRate = yRate
    }
}

class Circle {
    constructor(coordinate) {
        this._coordinate = coordinate
        this._velocity = new Velocity(0, 0)
        this._height = 50
        this._width = 50
    }

    makeBigger() {
        this._height += 1
        this._width += 1
    }

    get top() {
        return this._coordinate.y + this._height / 2
    }

    get bottom() {
        return this._coordinate.y - this._height / 2
    }

    get right() {
        return this._coordinate.x + this._width / 2
    }

    get left() {
        return this._coordinate.x - this._width / 2
    }

    set velocity(velocity) {
        this._velocity = velocity
    }

    get velocity() {
        return this._velocity
    }

    render() {
        this._updatePosition()
        ellipse(this._coordinate.x, this._coordinate.y, this._width, this._height)
    }

    _updatePosition() {
        this._coordinate.x += this._velocity.xRate
        this._coordinate.y += this._velocity.yRate
    }
}
