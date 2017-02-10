class RandomizeVelocityRule {
    constructor(circle) {
        this._circle = circle
        this._randomExecutor = new RandomExecutor(() => {
            this._circle.velocity = Velocity.createRandomVelocity()
        })
    }

    execute() {
        this._randomExecutor.execute()
    }
}

class EatenRule {
    constructor(players) {
        this._players = players
        this._subscribers = []
    }

    _onEaten(player, eatenPlayer) {
        this._subscribers.forEach((subscriber) => subscriber(player, eatenPlayer))
    }

    subscribeToOnEatenEvent(eventHandler) {
        this._subscribers.push(eventHandler)
    }

    execute() {
        for (var i = 0; i < this._players.length; i++) {
            for (var k = i + 1; k < this._players.length; k++) {
                var playerA = this._players[i]
                var playerB = this._players[k]

                var distance = playerA.circle.position.getDistance(playerB.circle.position)
                var threshold = Math.abs(playerA.circle.radius - playerB.circle.radius)
                if (distance < threshold) {
                    if (playerA.circle.radius > playerB.circle.radius) {
                        playerA.eat(playerB)
                        this._onEaten(playerA, playerB)
                    } else if (playerB.circle.radius > playerA.circle.radius) {
                        playerB.eat(playerA)
                        this._onEaten(playerB, playerA)
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

class GameOverRule {
    constructor(system) {
        this._system = system
        this._seconds = 0
        setInterval(() => this._seconds++, 1000)
    }

    execute() {
        if (this._system.players.length == 1) {
            console.log(this._system.players[0].name + " wins!")
            console.log("Game took " + this._seconds + " seconds")
            this._system.reset()
        }
    }
}

class RandomPowerupRule {
    constructor(player) {
        this._player = player
        this._randomExecutor = new RandomExecutor(() => {
            this._player.powerup()
        }, 200)
    }

    execute() {
        this._randomExecutor.execute()
    }
}

class RandomPowerdownRule {
    constructor(player) {
        this._player = player
        this._randomExecutor = new RandomExecutor(() => {
            this._player.powerdown()
        })
    }

    execute() {
        this._randomExecutor.execute()
    }
}

class RandomExecutor {
    constructor(method, randomFactor) {
        this._method = method
        this._lowerBound = 10
        this._upperBound = randomFactor == null ? 500 : randomFactor
        this._randomFactor = this._createRandomFactor()
        this._executeCount = 0
    }
    execute() {
        this._executeCount++
            if (this._executeCount > this._randomFactor) {
                this._executeCount = 0
                this._randomFactor = this._createRandomFactor()
                this._method()
            }
    }

    _createRandomFactor() {
        return random(this._lowerBound, this._upperBound)
    }
}
