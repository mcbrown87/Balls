var mySystem
var myCanvas

function setup() {
    myCanvas = new Canvas(windowWidth, windowHeight)
    mySystem = new System(myCanvas)
    myCanvas.create()
}

function draw() {
    background(255, 0, 200);

    if (keyIsDown(ENTER)) {
        mySystem.players[0].powerup()
    }

    mySystem.render()
}

function windowResized() {
    myCanvas.resize(windowWidth, windowHeight);
}

class System {
    constructor(canvas) {
        this._players = []
        for (var i = 0; i < 10; i++) {
            this._players.push(new Player(new Circle(canvas, canvas.getRandomCoordinate()), 'blah' + i))
        }

        var rules = []
        rules.push(new EatenRule(this._players))
        this._players.forEach(function(player) {
            rules.push(new BoundaryRule(new CollisionDetector(canvas, player.circle), player.circle))
            rules.push(new RandomizeVelocityRule(player.circle))
        })

        this._rules = rules
    }

    get players() {
        return this._players
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

class Player {
    constructor(circle, name) {
        this._circle = circle
        this._name = name
        this._dead = false
    }

    get circle() {
        return this._circle
    }

    powerup() {
        this.circle.makeBigger()
    }

    eat(player) {
        this.circle.makeBigger()
        player.kill()
    }

    kill() {
        this._dead = true
    }

    get isDead() {
        return this._dead
    }

    render() {
        this.circle.render()
        textAlign(CENTER)
        strokeWeight(0).textSize(12);
        text(this._name, this.circle.position.x, this.circle.position.y)
    }
}

class RandomizeVelocityRule {
    constructor(circle) {
        this._circle = circle
        this._randomFactor = this._createRandomFactor()
        this._executeCount = 0
    }

    execute() {
        this._executeCount++
            if (this._executeCount > this._randomFactor) {
                this._executeCount = 0
                this._randomFactor = this._createRandomFactor()
                this._circle.velocity = Velocity.createRandomVelocity()
            }
    }

    _createRandomFactor(){
      return random(10, 500)
    }
}

class EatenRule {
    constructor(players) {
        this._players = players
    }

    execute() {
        for (var i = 0; i < this._players.length; i++) {
            for (var k = i + 1; k < this._players.length; k++) {
                var playerA = this._players[i]
                var playerB = this._players[k]

                var distance = playerA.circle.position.getDistance(playerB.circle.position)
                var threshold = (playerA.circle.radius + playerB.circle.radius) * .5
                var threshold2 = Math.abs(playerA.circle.radius - playerB.circle.radius)
                if (distance < (threshold > threshold2 ? threshold : threshold2)) {
                    if (playerA.circle.radius > playerB.circle.radius) {
                        playerA.eat(playerB)
                    } else if (playerB.circle.radius > playerA.circle.radius) {
                        playerB.eat(playerA)
                    }
                }
            }
        }

        for (var i = 0; i < this._players.length; i++) {
            if (this._players[i].isDead) {
                this._players.splice(i, 1)
            }
        }
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

    get height() {
        return Math.abs(this.top - this.bottom)
    }

    get width() {
        return Math.abs(this.right - this.left)
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

    getDistance(coordinate) {
        return Math.sqrt(Math.pow(this.x - coordinate.x, 2) + Math.pow(this.y - coordinate.y, 2))
    }
}

class Velocity {
    constructor(xRate, yRate) {
        this._xRate = xRate
        this._yRate = yRate
    }

    static createRandomVelocity() {
        return new Velocity(random(-2, 2), random(-2, 2))
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
        this._diameter = 50
        this._canvas = canvas
    }

    makeBigger(factor) {
        this._diameter += this._diameter * (factor == null ? .05 : factor)

        if (this._diameter > this._canvas.height) {
            this._diameter = this._canvas.height
        }

        if (this._diameter > this._canvas.width) {
            this._diameter = this._canvas.width
        }
    }

    get position() {
        return this._coordinate
    }

    get top() {
        return this._coordinate.y + this.radius
    }

    get bottom() {
        return this._coordinate.y - this.radius
    }

    get right() {
        return this._coordinate.x + this.radius
    }

    get left() {
        return this._coordinate.x - this.radius
    }

    set velocity(velocity) {
        this._velocity = velocity
    }

    get velocity() {
        return this._velocity
    }

    get radius() {
        return this._diameter / 2
    }

    render() {
        this._updatePosition()
        strokeWeight(3);
        stroke(51);
        ellipse(this._coordinate.x, this._coordinate.y, this._diameter, this._diameter)
    }

    _updatePosition() {
        this._coordinate.x += this._velocity.xRate
        this._coordinate.y += this._velocity.yRate

        if (this.right > this._canvas.right) {
            this._coordinate.x = this._canvas.right - this.radius
        }

        if (this.left < this._canvas.left) {
            this._coordinate.x = this._canvas.left + this.radius
        }

        if (this.top > this._canvas.top) {
            this._coordinate.y = this._canvas.top - this.radius
        }

        if (this.bottom < this._canvas.bottom) {
            this._coordinate.y = this._canvas.bottom + this.radius
        }

        if (this._height > this._canvas.top) {
            this._diameter = this._canvas.top
        }

        if (this._width > this._canvas.right) {
            this._diameter = this._canvas.right
        }
    }
}
