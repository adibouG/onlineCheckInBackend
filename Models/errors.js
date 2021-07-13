
class EnzoError extends Error {
    constructor(message, type, code) {
        super(message) ;
        this.code = code ;
        this.type = type ;
    }
}

class Failure extends EnzoError {
    constructor(message, code) {
        super(message, code) ;
        this.type = 'failure' ;
    }
}

class NotFound extends Failure {
    constructor() {
        super('notFound', 404);
    }
}

class ExpiredLink extends Failure {
    constructor() {
        super(`expiredLink`, 403);
    }
}

module.exports = {
    EnzoError,
    Failure,
    NotFound,
    ExpiredLink
}