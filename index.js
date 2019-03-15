const DEFAULT_CACHE_AGE = 1000;
const FlashCache = require('flash-cache');

class FlashCachRedis {
    constructor({redisClient,interval=DEFAULT_CACHE_AGE}) {
        this.redisClient = redisClient;
        this.cacheResult = new FlashCache({interval});

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
        const itemValue = cacheResult.get(itemName);
        if (itemValue) {
            return callback(null,itemValue);
        }
        queryParams[paramCount] = function redisCallback(err,reply) {
            callback(err,reply);
            cacheResult.save(itemName,reply);
        };

        this.redisClient[fun](...queryParams);
    }
}

module.exports = FlashCachRedis;