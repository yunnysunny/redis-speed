const async = require('neo-async');
const EMPTY_FUN = 'empty_fun';
/**
 * @typeof ResultArray
 * @type {Array}
 * @property {Error} 0 - the error to return.
 * @property {String|Object} 1 - the value to return.
 */

/**
 * @function ParallelArrayCallback
 * 
 * @param {Boolean} allDone it always be true
 * @param {ResultArray[]} results 
 */
/**
 * @function ParallelObjectCallback
 * 
 * @param {Boolean} allDone it always be true
 * @param {Object.<String,ResultArray>} results 
 */
/**
 * redis helper class
 */
class RedisHelper {
    constructor({redisClient}) {
        this._redisClient = redisClient;
    }
    /**
     * @private
     * @param {Array[]} task 
     */
    _redisStepFun(task) {
        const redisClient = this._redisClient;
        return function callbackParallel(callback) {
            const [fun,...params] = task;
            if (fun === EMPTY_FUN) {
                return callback(false,params);
            }
            params.push(function parallelCallback(err,reply) {
                callback(false,[err,reply]);
            });
            redisClient[fun].apply(redisClient,params);
        };
    
    }
    /**
     * Do redis requests in parallel, it will continue even if one of request fails.
     *
     * @param {Array|Object} tasks
     * @param {ParallelArrayCallback|ParallelObjectCallback} callback If the tasks is a type of Array, callback will be a ParallelArrayCallback, otherwise it is a ParallelObjectCallback.
     */
    doParallelJobs(tasks,callback) {

        const _this = this;
        if (Array.isArray(tasks)) {
            tasks = tasks.map(function(task) {
                return _this._redisStepFun(task);
            });
        } else {
            const keys = Object.keys(tasks);
            for (var key of keys) {
                tasks[key] = _this._redisStepFun(tasks[key]);
            }
        }
    
        async.parallel(tasks,callback);
    }
}
/**
 * The empty function to help you to insert empty operation among normal operation.
 * 
 * @constant
 * @type {String}
 */
RedisHelper.EMPTY_FUN = EMPTY_FUN;
module.exports = RedisHelper;

