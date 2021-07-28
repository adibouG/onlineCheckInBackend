class EnzoError extends Error {
    constructor(message, code, type) {
        super(message) ;
        this.code = code ;
        this.type = type ;
       
       
    }
}
class Failure extends EnzoError {
    constructor(message, code, type = 'failure') {
        super(message, code, type) ;
    }
}
class NotFound extends Failure {
    constructor(message = 'notFound', code = 404) {
        super(message, code);
    }
}
class ExpiredLink extends Failure {
    constructor(message = 'expiredLink', code = 403) {
        super(message, code);
    }
}

module.exports = {
    EnzoError,
    Failure,
    NotFound,
    ExpiredLink
}