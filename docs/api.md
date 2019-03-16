<a name="FlashCachRedis"></a>

## FlashCachRedis
FlashCachRedisA tool that cache the data in memory to reduce the frequency of reading redis. It use the package of [flash-cache](https://www.npmjs.com/package/flash-cache) inside.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cacheQueryAdapter | <code>Object</code> | An wrapper of redis query fucntion , such as `get` `hget` `smembers` `zrange`. |

<a name="new_FlashCachRedis_new"></a>

### new FlashCachRedis(option)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| option | <code>Object</code> |  |  |
| option.redisClient | <code>Redis</code> |  |  |
| [option.interval] | <code>Number</code> | <code>1000</code> | The milliseconds of lifecyle of the data saved in memory |
| [option.useYoungOnly] | <code>Boolean</code> |  | Whether only reading the data from young area , it will passed to the instance of `FlashCache`. |

**Example**  
```javascriptconst {FlashCacheRedis} = require('redis-speed');const Redis = require('ioredis');const redisClient = new Redis();//connect to the redis server of localhost:6379const {cacheQueryAdapter} = new FlashCacheRedis({   redisClient,//the redis client object   interval:1000});const KEY = 'flash_cache_redis:basic';const VALUE = {name:'sunny',id:1};//First query the `key` in memory, if not have, query in redis. cacheQueryAdapter.get(key,function(err,reply) {});```
