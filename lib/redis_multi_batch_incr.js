const EventEmitter = require('events');
/**
 * @namespace RedisMultiBatchIncr
 */
/**
 * @constant {String} EVENT_ONE_LOOP_FINISHED The event triggered when send a batch of commands finish.
 * @memberof RedisMultiBatchIncr
 */
const EVENT_ONE_LOOP_FINISHED = exports.EVENT_ONE_LOOP_FINISHED = 'one_loop_finished';
/**
 * @constant {String} EVENT_SEND_ERROR The event tirggered when send command to redis fail.
 * @memberof RedisMultiBatchIncr
 */
const EVENT_SEND_ERROR = exports.EVENT_SEND_ERROR = 'send_error';
/**
 * @constant {String} EVENT_EXPIRE_ERROR The event triggered when set expire time fail.
 * @memberof RedisMultiBatchIncr
 */
const EVENT_EXPIRE_ERROR = exports.EVENT_EXPIRE_ERROR = 'expired_error';

/**
 * @typedef BatchOption
 * @memberof RedisMultiBatchIncr
 * 
 * @param {Object} redisClient The instance of ioredis client.
 * @param {String} cmd The name of redis command.
 * @param {Number} [loopInterval=200] The milliseconds of the interval to send a batch of commands.
 * @param {Number} [expireTime] The seconds used to set the redis key.
 */

/**
 * The class for sending batch redis commands.
 * @class
 * 
 */
const RedisMultiBatchIncr = exports.RedisMultiBatchIncr = class RedisMultiBatchIncr extends EventEmitter {
    /**
     * The constructor of RedisBatchIncr
     * @param {BatchOption} option 
     */
    constructor({
        redisClient,cmd,loopInterval=200,expireTime=7200
    }={}) {
        super();
        if (!cmd) {
            throw new Error('cmd should be given');
        }
        this._redisClient = redisClient;
        this._valueMap = new Map();
        this._loopInterval = loopInterval;
        this._cmd = cmd;
        
        this._expireTime = expireTime;
        this._doLoop();
    }
    /**
     * Add data to interval map.
     * 
     * 
     * @param {String} key 
     * @param {Number} score 
     * @param {String} value 
     */
    addData(key,score,value) {
        const map = this._valueMap;
        const item = map.get(key) || new Map() ;
        const oldScore = item.get(value) || 0;
        item.set(value, oldScore + score);
        map.set(key,item);
    }
    buildCmdParams() {
        throw new Error('not implemented');
    }
    /**
     * @private
     * @fires RedisBatchIncr#EVENT_SEND_ERROR
     * @fires RedisBatchIncr#EVENT_ONE_LOOP_FINISHED
     * @fires RedisBatchIncr#EVENT_EXPIRE_ERROR
     */
    _doSendPipeline() {
        const redisClient = this._redisClient;
        var keyLen = this._valueMap.size;
        const _this = this;

        const expireTime = this._expireTime;
        for (const [key,item] of this._valueMap) {
            const itemLen = item.size;
            const data = new Array(itemLen);
            var i = 0;
            for (const [value, score] of item) {
                data[i] = this.buildCmdParams (key, value, score);
                i++;
            }
            redisClient.pipeline(data).exec(function finish(err) {
                if (err) {
                    /**
                     * @event RedisBatchIncr#EVENT_SEND_ERROR
                     * @type {Error} err
                     * @type {String} key
                     * @type {String|Object} data
                     */
                    _this.emit(EVENT_SEND_ERROR,err,key,data);
                }
                keyLen--;
                if (keyLen === 0) {
                    /**
                     * @event RedisBatchIncr#EVENT_ONE_LOOP_FINISHED
                     */
                    _this.emit(EVENT_ONE_LOOP_FINISHED);
                }
            });
            redisClient.expire(key, expireTime, function(err) {
                /**
                 * @event RedisBatchIncr#EVENT_EXPIRE_ERROR
                 * @type {Error} err
                 */
                _this.emit(EVENT_EXPIRE_ERROR,err);
            });
        }
        this._valueMap.clear();
    }
    /**
     * @private
     */
    _doLoop() {
        const _this = this;
        setTimeout(function batchLoop() {
            _this._doSendPipeline();
            _this._doLoop();
        },this._loopInterval);
    }

};
/**
 * The utility class to send zincr command in batch.
 * @class
 */
exports.BatchMultiZincrby = class BatchMultiZincrby extends RedisMultiBatchIncr {
    constructor(option) {
        option.cmd = 'zincrby';
        super(option);
    }

    buildCmdParams(key, value, score) {
        return [this._cmd , key, score, value];
    }
};
/**
 * The utility class to send hincr command in batch.
 * @class
 */
exports.BatchMultiHincr = class BatchMultiHincr extends RedisMultiBatchIncr {
    constructor(option) {
        option.cmd = 'hincrby';
        super(option);
    }

    buildCmdParams(key, value, score) {
        return [this._cmd , key, value, score];
    }
};