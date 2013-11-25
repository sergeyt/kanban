var Future = Npm.require("fibers/future");
var fogbugz = Npm.require("fogbugz.js");

function toFuture(promiseFn, that){
    return function(){
        var args = [].slice.call(arguments);
        var future = new Future();
        var cb = future.resolver();
        promiseFn.apply(that, args).done(function(result){
            if (Array.isArray(result)){
                cb(result.map(convertIt));
            } else {
                cb(convertIt(result));
            }
        });
        return future.wait();
    };
}

// converts object with promise functions to object with future functions
function convertIt(it){
    var result = {};
    Object.keys(it).forEach(function(key){
        var v = it[key];
        if (typeof v == 'function'){
            v = toFuture(v.bind(it));
        } else if (typeof v == 'object') {
            if (Array.isArray(v)) {
                v = v.map(convertIt);
            } else {
                v = convertIt(v);
            }
        }
        result[key] = v;
    });
    return result;
}

FOGBUGZ = {
  // Creates fogbugz client with specified options
  //
  // @param options {Object} (required) See https://npmjs.org/package/fogbugz.js
  // @returns {Object} The instance of fogbugz client
  connect: function (options) {
    // return toFuture(fogbugz, null)(options);
    return fogbugz(options);
  }
};