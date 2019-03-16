# redis-speed

An utility for redis aim to improve the performance of redis, it includes `FlashCacheRedis` now.

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

## API
[api](docs/api.md)

## License
[MIT](LICENSE)



