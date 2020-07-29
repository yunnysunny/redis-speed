const DEFAULT_CACHE_AGE = 1000;
const FlashCache = require('flash-cache');
/**
 * @class FlashCachRedis
 * 
 * A tool that cache the data in memory to reduce the frequency of reading redis. It use the package of [flash-cache](https://www.npmjs.com/package/flash-cache) inside.
 * 
 * @property {Object} cacheQueryAdapter An wrapper of redis query fucntion , such as `get` `hget` `smembers` `zrange`.
 * @example
 * ```javascript
 * const {FlashCacheRedis} = require('redis-speed');
 * const Redis = require('ioredis');
 * const redisClient = new Redis();//connect to the redis server of localhost:6379
 * const {cacheQueryAdapter} = new FlashCacheRedis({
 *    redisClient,//the redis client object
 *    interval:1000
 * });
 * const KEY = 'flash_cache_redis:basic';
 * const VALUE = {name:'sunny',id:1};
 * 
 * //First query the `key` in memory, if not have, query in redis. 
 * cacheQueryAdapter.get(key,function(err,reply) {});
 * ```
 */
class FlashCachRedis {
    /**
     * 
     * @param {Object} option
     * @param {Redis} option.redisClient
     * @param {Number} [option.interval=1000] The milliseconds of lifecyle of the data saved in memory
     * @param {Boolean} [option.useYoungOnly] Whether only reading the data from young area , it will passed to the instance of `FlashCache`.
     */
    constructor({redisClient, interval = DEFAULT_CACHE_AGE, useYoungOnly = false}) {
        this.redisClient = redisClient;
        this.cacheResult = new FlashCache({interval});
        this._useYoungOnly = useYoungOnly;

        const commands = redisClient.getBuiltinCommands();
        const _this = this;
        this.cacheQueryAdapter = {};
        for (let command of commands) {
            this.cacheQueryAdapter[command] = function newRedisCommand(...args) {
                _this.queryWithCache(command,...args);
            };
        }
    }
    queryWithCache(fun,...args) {
        let saveFlag = true;
        if (typeof args[0] === 'boolean') {
            saveFlag = args.shift();
        }
        const len = args.length;
        const lastParam = args[len -1];
        let callback = function(){};
        let paramCount = 0;
        if (typeof(lastParam) === 'function') {
            callback = lastParam;
            paramCount = len -1;
        } else {
            paramCount = len;
        }
        let itemName = fun;
        const queryParams = new Array(paramCount+1);
        for (let i=0;i<paramCount;i++) {
            const p = args[i];
            itemName += ':' + p;
            queryParams[i] = p;
        }
        const cacheResult = this.cacheResult;
        if (saveFlag) {
            const element = cacheResult.getElement(itemName, this._useYoungOnly);
            if (element) {
                return callback(null,element.value);
            }
        }
        queryParams[paramCount] = function redisCallback(err,reply) {
            callback(err,reply);
            if (saveFlag) {
                cacheResult.save(itemName,reply);
            }
        };

        this.redisClient[fun](...queryParams);
    }
}

module.exports = FlashCachRedis;