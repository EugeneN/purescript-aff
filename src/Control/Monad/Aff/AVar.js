// module Control.Monad.Aff.AVar

function _makeVar(nonCanceler) {
    return function(success, error) {
        try {
            success({
                consumers: [],
                producers: [],
                error: undefined
            });
        } catch (e) {
            error(e);
        }

        return nonCanceler;
    }
}

function _takeVar(nonCanceler, avar) {
    return function(success, error) {
        if (avar.error !== undefined) {
            error(avar.error);
        } else if (avar.producers.length > 0) {
            var producer = avar.producers.shift();

            producer(success, error);
        } else {
            avar.consumers.push({success: success, error: error});
        }

        return nonCanceler;
    }
}

function _putVar(nonCanceler, avar, a) {
    return function(success, error) {
        if (avar.error !== undefined) {
            error(avar.error);
        } else if (avar.consumers.length === 0) {
            avar.producers.push(function(success, error) {
                try {
                    success(a);
                } catch (e) {
                    error(e);
                }
            });

            success({});
        } else {
            var consumer = avar.consumers.shift();

            try {
                consumer.success(a);
            } catch (e) {
                error(e);

                return;
            }

            success({});
        }

        return nonCanceler;
    }
}

function _killVar(nonCanceler, avar, e) {
    return function(success, error) {
        if (avar.error !== undefined) {
            error(avar.error);
        } else {
            var errors = [];

            avar.error = e;

            while (avar.consumers.length > 0) {
                var consumer = avar.consumers.shift();

                try {
                    consumer.error(e);
                } catch (e) {
                    errors.push(e);
                }
            }

            if (errors.length > 0) error(errors[0]);
            else success({});
        }

        return nonCanceler;
    }
}

