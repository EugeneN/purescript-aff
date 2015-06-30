// module Control.Monad.Aff.Unsafe

function unsafeTrace(v) {
    return function(success, error) {
        console.log(v);

        try {
            success(v);
        } catch (e) {
            error(e);
        }

        var nonCanceler;

        nonCanceler = function(e) {
            return function(sucess, error) {
                success(false);

                return nonCanceler;
            }
        };

        return nonCanceler;
    };
}

function unsafeInterleaveAff(aff) {
    return aff;
}
