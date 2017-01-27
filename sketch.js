var mySystem
var myCanvas

function setup() {
    myCanvas = new Canvas(windowWidth, windowHeight)
    mySystem = new System(myCanvas)
    myCanvas.create()
}

function draw() {
    background(255, 0, 200);
    mySystem.render()
}

function windowResized() {
    myCanvas.resize(windowWidth, windowHeight);
}

class System {
    constructor(canvas) {
        this._players = []
        for (var i = 0; i < 150; i++) {
            this._players.push(new Circle(canvas, canvas.getRandomCoordinate()))
        }

        var rules = []
        this._players.forEach(function(circle) {
            rules.push(new BoundaryRule(new CollisionDetector(canvas, circle), circle))
            rules.push(new MakeBiggerRule(new CollisionDetector(canvas, circle), circle))
        })

        this._rules = rules
    }

    render() {
        this._rules.forEach(function(rule) {
            rule.execute()
        })

        this._players.forEach(function(player) {
            player.render()
        })
    }
}

class BoundaryRule {
    constructor(collisionDetector, circle) {
        this._collisionDetector = collisionDetector
        this._circle = circle
    }

    execute() {
        if (this._collisionDetector.rightCollision ||
            this._collisionDetector.leftCollision) {
            this._circle.velocity.xRate *= -1
        }

        if (this._collisionDetector.topCollision ||
            this._collisionDetector.bottomCollision) {
            this._circle.velocity.yRate *= -1
        }
    }
}

class MakeBiggerRule {
    constructor(collisionDetector, circle) {
        this._collisionDetector = collisionDetector
        this._circle = circle
    }

    execute() {
        if (this._collisionDetector.anyCollision) {
            this._circle.makeBigger()
        }
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

    getRandomCoordinate() {
        return new Coordinate(random(this.left, this.right), random(this.bottom, this.top))
    }

    resize(windowWidth, windowHeight) {
        this._x = windowWidth
        this._y = windowHeight
        resizeCanvas(windowWidth, windowHeight)
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

    static createRandomVelocity() {
        return new Velocity(random(-1, 1), random(-1, 1))
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
    constructor(canvas, coordinate, velocity) {
        this._coordinate = coordinate == null ? canvas.center : coordinate
        this._velocity = velocity == null ? Velocity.createRandomVelocity() : velocity
        this._height = 50
        this._width = 50
        this._canvas = canvas
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
        strokeWeight(2);
        stroke(51);
        ellipse(this._coordinate.x, this._coordinate.y, this._width, this._height)
    }

    _updatePosition() {
        this._coordinate.x += this._velocity.xRate
        this._coordinate.y += this._velocity.yRate

        if (this.right > this._canvas.right) {
            this._coordinate.x = this._canvas.right - this._width / 2
        }

        if (this.left < this._canvas.left) {
            this._coordinate.x = this._canvas.left + this._width / 2
        }

        if (this.top > this._canvas.top) {
            this._coordinate.y = this._canvas.top - this._height / 2
        }

        if (this.bottom < this._canvas.bottom) {
            this._coordinate.y = this._canvas.bottom + this._height / 2
        }

        if (this._height > this._canvas.top) {
            this._height = this._canvas.top
        }

        if (this._width > this._canvas.right) {
            this._width = this._canvas.right
        }
    }
}
