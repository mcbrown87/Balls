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
        this._canvas = canvas
        this.reset()
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

    _generatePlayers() {
        let players = []

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'TFT',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_tft')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'PHILO',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_philo')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'TSN',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_tsn')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'SWFL',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_swfl')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'SPARHAWK',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_sparhawk')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'SF',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_sf')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'INF',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_inf')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'BP',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_bp')))

        players.push(new Player(new Circle(this._canvas, this._canvas.getRandomCoordinate()),
            'ACME',
            new JenkinsJob('http://sparhawkbuild:8080/view/6.1%20Delivery%20Pipeline/job/6_1_cd_scoped_acme')))

        return players
    }

    reset() {
        this._players = this._generatePlayers()
        var canvas = this._canvas

        var rules = []
        var eatenRule = new EatenRule(this._players)
        eatenRule.subscribeToOnEatenEvent((player, eatenPlayer) => {
            console.log(player.name + ' has eaten ' + eatenPlayer.name)
        })
        rules.push(eatenRule)
        rules.push(new GameOverRule(this))
        this._players.forEach(function(player) {
            rules.push(new BoundaryRule(new CollisionDetector(canvas, player.circle), player.circle))
            rules.push(new RandomizeVelocityRule(player.circle))
        })

        this._rules = rules
    }
}

class Player {
    constructor(circle, name, jenkinsJob) {
        this._circle = circle
        this._name = name
        this._jenkinsJob = jenkinsJob
        this._totalTestCount = 0
        this._buildScore = 0
        this._jenkinsJob.score.then((buildScore) => this._buildScore = buildScore)
        this._jenkinsJob.latestCompletedBuild.then((latestCompletedBuild)=>{
            latestCompletedBuild.testReport.totalTestCount.then((totalTestCount)=>{
                this._totalTestCount = totalTestCount
            })
        })

        setInterval(() => {
            this._jenkinsJob.score.then((buildScore) => this._buildScore = buildScore)
            this._jenkinsJob.latestCompletedBuild.then((latestCompletedBuild)=>{
                latestCompletedBuild.testReport.totalTestCount.then((totalTestCount)=>{
                    this._totalTestCount = totalTestCount
                })
            })
        }, 60000)
        this._dead = false
    }

    get name() {
        return this._name
    }

    get circle() {
        return this._circle
    }

    get score() {
        return this._buildScore + this._totalTestCount
    }

    powerup() {
        this.circle.makeBigger()
    }

    powerdown() {
        this.circle.makeSmaller()
    }

    eat(player) {
        player.kill()
    }

    kill() {
        this._dead = true
    }

    get isDead() {
        return this._dead || this.circle.radius < 0
    }

    render() {
        this.circle.diameter = map(this.score, 0, 200, 50, 300)
        this.circle.render()
        textAlign(CENTER)
        strokeWeight(0).textSize(12);
        text(this._name + '\r\n' + this.score, this.circle.position.x, this.circle.position.y)
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
        return new Velocity(random(-.5, .5), random(-.5, .5))
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
        this._diameter = 100
        this._canvas = canvas
    }

    makeBigger(factor) {
        this.diameter += this._diameter * (factor == null ? .05 : factor)
    }

    makeSmaller(factor) {
        this.diameter -= this._diameter * (factor == null ? .05 : factor)
    }

    get diameter() {
        return this._diameter
    }

    set diameter(diameter) {
        this._diameter = diameter

        if (this._diameter > this._canvas.height) {
            this._diameter = this._canvas.height
        }

        if (this._diameter > this._canvas.width) {
            this._diameter = this._canvas.width
        }

        if (this._diameter < 0) {
            this._diameter = 0
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
