const async = require('neo-async');
const FlashCache = require('flash-cache');
const EMPTY_FUN = 'empty_fun';
const HAS_CALL_EXPIRE_BEFORE = -9;
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
    /**
     * 
     * @param {Object} option 
     * @param {Object} option.redisClient
     * @param {Number} option.expiredHour The hour in next day, it will used in #expire function to expire the given key in next day.
     * @param {Number} option.expiredCacheTime The milliseconds which used by RedisHelper to save the status of calling expire. when it greater than 0, RedisHelper will not call redis' expire command in `option.expiredCacheTime` milliseconds after you call `expire` function.
     */
    constructor({redisClient, expiredHour, expiredCacheTime}) {
        this._redisClient = redisClient;
        this._expiredHour = expiredHour;
        this._expiredCache =expiredCacheTime > 0 ? new FlashCache({expiredCacheTime}) : null;
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
    /**
     * Set the key's age, it will be expired in the next day's certain hour which given in the constructor function.
     * 
     * @param {String} key The key you wanna expire
     * @param {Function} callback The callback function of redis
     */
    expire(key, callback) {
        const date = new Date();
        const now = date.getTime();
        date.setDate(date.getDate() + 1);
        date.setHours(this._expiredHour);
        const expireTime = Math.floor((date - now) / 1000);
        const expiredCache = this._expiredCache;
        if (expiredCache) {
            const ele = expiredCache.getElement(key, true);
            if (ele && ele.value) {
                return callback(null, HAS_CALL_EXPIRE_BEFORE);
            }
        }
        this._redisClient.expire(key, expireTime, function(err, reply) {
            if (err) {
                return callback(err);
            }
            if (expiredCache) {
                expiredCache.save(key, expireTime);
            }
            callback(null, reply);
        });
    }
}
/**
 * The empty function to help you to insert empty operation among normal operation.
 * 
 * @constant
 * @type {String}
 */
RedisHelper.EMPTY_FUN = EMPTY_FUN;
/**
 * The flag to indicate whether you have call expire command on given key.
 * 
 * @constant
 * @type {Number}
 */
RedisHelper.HAS_CALL_EXPIRE_BEFORE = HAS_CALL_EXPIRE_BEFORE;
module.exports = RedisHelper;

