# redis-speed

An utility for redis aim to improve the performance of redis, it includes `FlashCacheRedis` now.

[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]

[npm-url]: https://npmjs.org/package/redis-speed
[travis-image]: https://img.shields.io/travis/yunnysunny/redis-speed.svg?style=flat-square
[travis-url]: https://travis-ci.org/yunnysunny/redis-speed
[coveralls-image]: https://img.shields.io/coveralls/yunnysunny/redis-speed.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yunnysunny/redis-speed?branch=master
[david-image]: https://img.shields.io/david/yunnysunny/redis-speed.svg?style=flat-square
[david-url]: https://david-dm.org/yunnysunny/redis-speed
[node-image]: https://img.shields.io/badge/node.js-%3E=_6-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

[![NPM](https://nodei.co/npm/redis-speed.png?downloads=true)](https://nodei.co/npm/redis-speed/) 

## FlashCacheRedis  

Save value in memory to reduce the frequency of reading redis.

### Usage

```javascript
const {FlashCacheRedis} = require('redis-speed');
const Redis = require('ioredis');
const redisClient = new Redis();//connect to the redis server of localhost:6379
const {cacheQueryAdapter} = new FlashCacheRedis({
    redisClient,//the redis client object
    interval:1000
});
const {expect} = require('chai');
const KEY = 'flash_cache_redis:basic';
const VALUE = {name:'sunny',id:1};

redisClient.set(KEY,JSON.stringify(VALUE),function(err) {//save session
    if (err) {
        return console.error(err);
    }
    //It will cache the value in FlashCacheRedis instance, when you call the function of `cacheQueryAdapter.get` next, it will read the value directly from memory.
    cacheQueryAdapter.get(KEY,function(err,obj) {
        if (err) {
            return console.error(err);
        }
        try {
            obj = JSON.parse(obj);
        } catch (e) {
            return console.error(e);
        }
        expect(obj).to.have.property('name').and.equal(VALUE.name);
    });
});
```

## RedisHelper
An utility class to do parallel job with redis. If your redis is run in cluster mode, it will not return the data properly with some functions, such as `pipeline` or `mutil`. `RedisHelper` is designed to resoved such issue.

### Usage

```javascript
const {RedisHelper} = require('redis-speed');
const key1 = 'key1';
const value1 = Math.random() + '';
const key2 = 'key2';
const value2 = Math.random() + '';
const tasks = [
    ['set',key1,value1],
    ['set',key2,value2]
];
redisHelper.doParallelJobs(tasks,function(none,[[err1],[err2]]) {

});
```

## redisBatchIncr
An utility class to send redis command in batch.

### Usage

```javascript
const {
    redisBatchIncr: {
        EVENT_ONE_LOOP_FINISHED,
        EVENT_SEND_ERROR,
        BatchHincr,
        BatchZincrby
    }
} = require('redis-speed');
const redisClient = new Redis();//connect to the redis server of localhost:6379

const LOOP_COUNT = 100;
const INTERVAL = 200;
const key = ('test:' + Math.random()).replace('.','');
const cmd = new BatchHincr({redisClient,loopInterval:INTERVAL,key});

cmd.on(EVENT_ONE_LOOP_FINISHED,function() {
    redisClient.hget(key,'name',function(err,reply) {
        if (err) {
            return console.error(err);
        }
        expect(Number(reply)).to.be.equal(LOOP_COUNT);
    });
});
cmd.on(EVENT_SEND_ERROR,function(err) {
    console.error(err);
});

for(var i=0;i<LOOP_COUNT;i++) {
    cmd.addData(1,'name');
}
```


## API
[api](docs/api.md)

## License
[MIT](LICENSE)



