const EventEmitter = require('events');
/**
 * @namespace RedisBatchIncr
 */
/**
 * @constant {String} EVENT_ONE_LOOP_FINISHED The event triggered when send a batch of commands finish.
 * @memberof RedisBatchIncr
 */
const EVENT_ONE_LOOP_FINISHED = exports.EVENT_ONE_LOOP_FINISHED = 'one_loop_finished';
/**
 * @constant {String} EVENT_SEND_ERROR The event tirggered when send command to redis fail.
 * @memberof RedisBatchIncr
 */
const EVENT_SEND_ERROR = exports.EVENT_SEND_ERROR = 'send_error';
/**
 * @constant {String} EVENT_EXPIRE_ERROR The event triggered when set expire time fail.
 * @memberof RedisBatchIncr
 */
const EVENT_EXPIRE_ERROR = exports.EVENT_EXPIRE_ERROR = 'expired_error';

/**
 * @typedef BatchOption
 * @memberof RedisBatchIncr
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
 * @memberof RedisBatchIncr
 */
const RedisBatchIncr = exports.RedisBatchIncr = class RedisBatchIncr extends EventEmitter {
    /**
     * The constructor of RedisBatchIncr
     * @param {BatchOption} option 
     */
    constructor({
        redisClient,cmd,loopInterval=200,expireTime=7200,key
    }={}) {
        super();
        if (!cmd) {
            throw new Error('cmd should be given');
        }
        this._redisClient = redisClient;
        this._valueMap = new Map();
        this._loopInterval = loopInterval;
        this._cmd = cmd;
        this._key = key;
        
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
    addData(score,value) {

        const oldScore = this._valueMap.get(value) || 0;
        this._valueMap.set(value, oldScore + score);
    }
    _buildCmdParams() {
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
        var valueLen = this._valueMap.size;
        const _this = this;

        const expireTime = this._expireTime;
        var i = 0;
        const data = new Array(valueLen);
        for (const [value, score] of this._valueMap) {
            data[i] = this._buildCmdParams (value, score);
            i++;
        }
        redisClient.pipeline(data).exec(function finish(err) {
            if (err) {
                /**
                 * @event RedisBatchIncr#EVENT_SEND_ERROR
                 * @type {Error} err
                 * @type {String|Object} data
                 */
                _this.emit(EVENT_SEND_ERROR,err,data);
            }

            /**
             * @event RedisBatchIncr#EVENT_ONE_LOOP_FINISHED
             * @type {Number} len The length of members
             */
            _this.emit(EVENT_ONE_LOOP_FINISHED, valueLen);
        });
            
        
        redisClient.expire(this._key, expireTime, function(err) {
            /**
             * @event RedisBatchIncr#EVENT_EXPIRE_ERROR
             * @type {Error} err
             */
            _this.emit(EVENT_EXPIRE_ERROR,err);
        });
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
 * @memberof RedisBatchIncr
 */
exports.BatchZincrby = class BatchZincrby extends RedisBatchIncr {
    constructor(option) {
        option.cmd = 'zincrby';
        super(option);
    }

    _buildCmdParams(value, score) {
        return [this._cmd , this._key, score, value];
    }
};
/**
 * The utility class to send hincr command in batch.
 * @class
 * @memberof RedisBatchIncr
 */
exports.BatchHincr = class BatchHincr extends RedisBatchIncr {
    constructor(option) {
        option.cmd = 'hincrby';
        super(option);
    }

    _buildCmdParams( value, score) {
        return [this._cmd , this._key, value, score];
    }
};
