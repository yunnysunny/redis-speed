const EventEmitter = require('events');
/**
 * @namespace redisBatchCmd
 */
/**
 * @constant {String} EVENT_ONE_LOOP_FINISHED The event triggered when send a batch of commands finish.
 * @memberof redisBatchCmd
 */
const EVENT_ONE_LOOP_FINISHED = exports.EVENT_ONE_LOOP_FINISHED = 'one_loop_finished';
/**
 * @constant {String} EVENT_SEND_ERROR The event tirggered when send command to redis fail.
 * @memberof redisBatchCmd
 */
const EVENT_SEND_ERROR = exports.EVENT_SEND_ERROR = 'send_error';
/**
 * @constant {String} EVENT_EXPIRE_ERROR The event triggered when set expire time fail.
 * @memberof redisBatchCmd
 */
const EVENT_EXPIRE_ERROR = exports.EVENT_EXPIRE_ERROR = 'expired_error';

/**
 * @typedef BatchOption
 * @memberof redisBatchCmd
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
 * @memberof redisBatchCmd
 */
const RedisBatchCmd = exports.RedisBatchCmd = class RedisBatchCmd extends EventEmitter {
    /**
     * The constructor of RedisBatchCmd
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
     * @abstract
     * 
     * @param {String} key 
     * @param {Number} score 
     * @param {String} value 
     */
    addData(key,score,value) {
        throw new Error('not supported');
    }
    /**
     * @private
     * @fires RedisBatchCmd#EVENT_SEND_ERROR
     * @fires RedisBatchCmd#EVENT_ONE_LOOP_FINISHED
     * @fires RedisBatchCmd#EVENT_EXPIRE_ERROR
     */
    _doSendPipeline() {
        const redisClient = this._redisClient;
        var keyLen = this._valueMap.size;
        const _this = this;

        const expireTime = this._expireTime;
        for (const [key,data] of this._valueMap) {
            redisClient.pipeline(data).exec(function finish(err) {
                if (err) {
                    /**
                     * @event RedisBatchCmd#EVENT_SEND_ERROR
                     * @type {Error} err
                     * @type {String} key
                     * @type {String|Object} data
                     */
                    _this.emit(EVENT_SEND_ERROR,err,key,data);
                }
                keyLen--;
                if (keyLen === 0) {
                    /**
                     * @event RedisBatchCmd#EVENT_ONE_LOOP_FINISHED
                     */
                    _this.emit(EVENT_ONE_LOOP_FINISHED);
                }
            });
            redisClient.expire(key, expireTime, function(err) {
                /**
                 * @event RedisBatchCmd#EVENT_EXPIRE_ERROR
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
 * @memberof redisBatchCmd
 */
exports.BatchZincrby = class BatchZincrby extends RedisBatchCmd {
    constructor(option) {
        option.cmd = 'zincrby';
        super(option);
    }
    addData(key,score,value) {
        const map = this._valueMap;
        const data = (map.get(key) || []) ;
        data.push(['zincrby',key,score,value]);
        map.set(key,data);
    }
    
};
/**
 * The utility class to send hincr command in batch.
 * @class
 * @memberof redisBatchCmd
 */
exports.BatchHincr = class BatchHincr extends RedisBatchCmd {
    constructor(option) {
        option.cmd = 'hincrby';
        super(option);
    }
    addData(key,score,value) {
        const map = this._valueMap;
        const data = (map.get(key) || []) ;
        data.push(['hincrby',key,value,score]);
        map.set(key,data);
    }

};
