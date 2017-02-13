class JenkinsEndpoint {
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
}

class JenkinsJob extends JenkinsEndpoint {
    constructor(url) {
        super(url)
    }

    get score() {
        return new Promise((resolve, reject) => {
            this._getData().then((jenkinsJob) => {
                resolve(jenkinsJob.healthReport[0].score)
            })
        })
    }

    get latestCompletedBuild() {
        return new Promise((resolve, reject) => {
            this._getData().then((jenkinsJob) => {
                resolve(new JenkinsJobInstance(jenkinsJob.lastCompletedBuild.url))
            })
        })
    }
}

class JenkinsJobInstance extends JenkinsEndpoint {
    constructor(url) {
        super(url)
        this._testReportEndpoint = url + '/testReport'
    }

    get testReport() {
        return new JenkinsTestReport(this._testReportEndpoint)
    }
}

class JenkinsTestReport extends JenkinsEndpoint {
    constructor(url) {
        super(url)
    }

    get totalTestCount() {
        return new Promise((resolve, reject) => {
            this._getData().then((testReport) => {
                resolve(testReport.passCount + testReport.failCount)
            })
        })
    }
}
