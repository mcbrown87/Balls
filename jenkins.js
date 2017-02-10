class JenkinsJob {
    constructor(url) {
        this._url = url + "/api/json"
    }

    _getData() {
        return new Promise((resolve, reject) => {
            loadJSON(this._url, (data) => {
                resolve(data)
            })
        })
    }

    get score() {
        return new Promise((resolve, reject) => {
            this._getData().then((data) => {
                resolve(data.healthReport[0].score)
            })
        })
    }
}
