var Promise = require('es6-promise').Promise;

function promisify(func) {
  // Already a Promise.
  if (func && typeof func.then === 'function') {
    return func;
  }

  return function () {
    var args = Array.prototype.slice.apply(arguments);

    return new Promise(function (resolve, reject) {
      func.apply(this, args.concat(function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }));
    });
  };
}

/*
Sample usage:
  var Joi = require('joi');  // Using a library whose methods are promises.
  var validate = promisify(Joi.validate);  // Wraps `Joi.validate` in a promise.
