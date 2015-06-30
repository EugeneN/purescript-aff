// module Control.Monad.Aff


function _cancelWith(nonCanceler, aff, canceler1) {
    return function(success, error) {
        var canceler2 = aff(success, error);

        return function(e) {
            return function(success, error) {
                var cancellations = 0;
                var result        = false;
                var errored       = false;

                var s = function(bool) {
                    cancellations = cancellations + 1;
                    result        = result || bool;

                    if (cancellations === 2 && !errored) {
                        try {
                            success(result);
                        } catch (e) {
                            error(e);
                        }
                    }
                };

                var f = function(err) {
                    if (!errored) {
                        errored = true;

                        error(err);
                    }
                };

                canceler2(e)(s, f);
                canceler1(e)(s, f);

                return nonCanceler;
            };
        };
    };
}

function _setTimeout(nonCanceler, millis, aff) {
    var set = setTimeout, clear = clearTimeout;
    if (millis <= 0 && typeof setImmediate === "function") {
        set = setImmediate;
        clear = clearImmediate;
    }
    return function(success, error) {
        var canceler;

        var timeout = set(function() {
            canceler = aff(success, error);
        }, millis);

        return function(e) {
            return function(s, f) {
                if (canceler !== undefined) {
                    return canceler(e)(s, f);
                } else {
                    clear(timeout);

                    try {
                        s(true);
                    } catch (e) {
                        f(e);
                    }

                    return nonCanceler;
                }
            };
        };
    };
}

function _unsafeInterleaveAff(aff) {
    return aff;
}

function _forkAff(nonCanceler, aff) {
    var voidF = function(){};

    return function(success, error) {
        var canceler = aff(voidF, voidF);

        try {
            success(canceler);
        } catch (e) {
            error(e);
        }

        return nonCanceler;
    };
}

function _makeAff(cb) {
    return function(success, error) {
        return cb(function(e) {
            return function() {
                error(e);
            };
        })(function(v) {
            return function() {
                try {
                    success(v);
                } catch (e) {
                    error(e);
                }
            };
        })();
    }
}

function _pure(nonCanceler, v) {
    return function (success, error) {
        try {
            success(v);
        } catch (e) {
            error(e);
        }

        return nonCanceler;
    }
}

function _throwError(nonCanceler, e) {
    return function(success, error) {
        error(e);

        return nonCanceler;
    };
}

function _fmap(f, aff) {
    return function(success, error) {
        return aff(function(v) {
            try {
                success(f(v));
            } catch (e) {
                error(e);
            }
        }, error);
    };
}

function _bind(alwaysCanceler, aff, f) {
    return function(success, error) {
        var canceler1, canceler2;

        var isCanceled    = false;
        var requestCancel = false;

        var onCanceler = function(){};

        canceler1 = aff(function(v) {
            if (requestCancel) {
                isCanceled = true;

                return alwaysCanceler;
            } else {
                canceler2 = f(v)(success, error);

                onCanceler(canceler2);

                return canceler2;
            }
        }, error);

        return function(e) {
            return function(s, f) {
                requestCancel = true;

                if (canceler2 !== undefined) {
                    return canceler2(e)(s, f);
                } else {
                    return canceler1(e)(function(bool) {
                        if (bool || isCanceled) {
                            try {
                                s(true);
                            } catch (e) {
                                f(e);
                            }
                        } else {
                            onCanceler = function(canceler) {
                                canceler(e)(s, f);
                            };
                        }
                    }, f);
                }
            };
        };
    };
}

function _attempt(Left, Right, aff) {
    return function(success, error) {
        return aff(function(v) {
            try {
                success(Right(v));
            } catch (e) {
                error(e);
            }
        }, function(e) {
            try {
                success(Left(e));
            } catch (e) {
                error(e);
            }
        });
    };
}

function _runAff(errorT, successT, aff) {
    return function() {
        return aff(function(v) {
            try {
                successT(v)();
            } catch (e) {
                errorT(e)();
            }
        }, function(e) {
            errorT(e)();
        });
    };
}

function _liftEff(nonCanceler, e) {
    return function(success, error) {
        try {
            success(e());
        } catch (e) {
            error(e);
        }

        return nonCanceler;
    };
}


