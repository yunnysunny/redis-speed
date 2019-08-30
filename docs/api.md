## Classes

<dl>
<dt><a href="#FlashCachRedis">FlashCachRedis</a></dt>
<dd><p>FlashCachRedis</p>
<p>A tool that cache the data in memory to reduce the frequency of reading redis. It use the package of <a href="https://www.npmjs.com/package/flash-cache">flash-cache</a> inside.</p>
</dd>
<dt><a href="#RedisHelper">RedisHelper</a></dt>
<dd><p>redis helper class</p>
</dd>
</dl>

## Objects

<dl>
<dt><a href="#redisBatchCmd">redisBatchCmd</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#ParallelArrayCallback">ParallelArrayCallback(allDone, results)</a></dt>
<dd></dd>
<dt><a href="#ParallelObjectCallback">ParallelObjectCallback(allDone, results)</a></dt>
<dd></dd>
</dl>

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
<a name="RedisHelper"></a>

## RedisHelper
redis helper class

**Kind**: global class  

* [RedisHelper](#RedisHelper)
    * _instance_
        * [.doParallelJobs(tasks, callback)](#RedisHelper+doParallelJobs)
    * _static_
        * [.EMPTY_FUN](#RedisHelper.EMPTY_FUN) : <code>String</code>

<a name="RedisHelper+doParallelJobs"></a>

### redisHelper.doParallelJobs(tasks, callback)
Do redis requests in parallel, it will continue even if one of request fails.

**Kind**: instance method of [<code>RedisHelper</code>](#RedisHelper)  

| Param | Type | Description |
| --- | --- | --- |
| tasks | <code>Array</code> \| <code>Object</code> |  |
| callback | [<code>ParallelArrayCallback</code>](#ParallelArrayCallback) \| [<code>ParallelObjectCallback</code>](#ParallelObjectCallback) | If the tasks is a type of Array, callback will be a ParallelArrayCallback, otherwise it is a ParallelObjectCallback. |

<a name="RedisHelper.EMPTY_FUN"></a>

### RedisHelper.EMPTY\_FUN : <code>String</code>
The empty function to help you to insert empty operation among normal operation.

**Kind**: static constant of [<code>RedisHelper</code>](#RedisHelper)  
<a name="redisBatchCmd"></a>

## redisBatchCmd : <code>object</code>
**Kind**: global namespace  

* [redisBatchCmd](#redisBatchCmd) : <code>object</code>
    * [.RedisBatchCmd](#redisBatchCmd.RedisBatchCmd)
        * [new RedisBatchCmd()](#new_redisBatchCmd.RedisBatchCmd_new)
    * [.exports.BatchZincrby](#redisBatchCmd.exports.BatchZincrby)
    * [.exports.BatchHincr](#redisBatchCmd.exports.BatchHincr)
    * [.EVENT_ONE_LOOP_FINISHED](#redisBatchCmd.EVENT_ONE_LOOP_FINISHED) : <code>String</code>
    * [.EVENT_SEND_ERROR](#redisBatchCmd.EVENT_SEND_ERROR) : <code>String</code>
    * [.EVENT_EXPIRE_ERROR](#redisBatchCmd.EVENT_EXPIRE_ERROR) : <code>String</code>
    * [.BatchOption](#redisBatchCmd.BatchOption)

<a name="redisBatchCmd.RedisBatchCmd"></a>

### redisBatchCmd.RedisBatchCmd
**Kind**: static class of [<code>redisBatchCmd</code>](#redisBatchCmd)  
<a name="new_redisBatchCmd.RedisBatchCmd_new"></a>

#### new RedisBatchCmd()
The class for sending batch redis commands.

<a name="redisBatchCmd.exports.BatchZincrby"></a>

### redisBatchCmd.exports.BatchZincrby
The utility class to send zincr command in batch.

**Kind**: static class of [<code>redisBatchCmd</code>](#redisBatchCmd)  
<a name="redisBatchCmd.exports.BatchHincr"></a>

### redisBatchCmd.exports.BatchHincr
The utility class to send hincr command in batch.

**Kind**: static class of [<code>redisBatchCmd</code>](#redisBatchCmd)  
<a name="redisBatchCmd.EVENT_ONE_LOOP_FINISHED"></a>

### redisBatchCmd.EVENT\_ONE\_LOOP\_FINISHED : <code>String</code>
The event triggered when send a batch of commands finish.

**Kind**: static constant of [<code>redisBatchCmd</code>](#redisBatchCmd)  
<a name="redisBatchCmd.EVENT_SEND_ERROR"></a>

### redisBatchCmd.EVENT\_SEND\_ERROR : <code>String</code>
The event tirggered when send command to redis fail.

**Kind**: static constant of [<code>redisBatchCmd</code>](#redisBatchCmd)  
<a name="redisBatchCmd.EVENT_EXPIRE_ERROR"></a>

### redisBatchCmd.EVENT\_EXPIRE\_ERROR : <code>String</code>
The event triggered when set expire time fail.

**Kind**: static constant of [<code>redisBatchCmd</code>](#redisBatchCmd)  
<a name="redisBatchCmd.BatchOption"></a>

### redisBatchCmd.BatchOption
**Kind**: static typedef of [<code>redisBatchCmd</code>](#redisBatchCmd)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| redisClient | <code>Object</code> |  | The instance of ioredis client. |
| cmd | <code>String</code> |  | The name of redis command. |
| [loopInterval] | <code>Number</code> | <code>200</code> | The milliseconds of the interval to send a batch of commands. |
| [expireTime] | <code>Number</code> |  | The seconds used to set the redis key. |

<a name="ParallelArrayCallback"></a>

## ParallelArrayCallback(allDone, results)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| allDone | <code>Boolean</code> | it always be true |
| results | <code>Array.&lt;ResultArray&gt;</code> |  |

<a name="ParallelObjectCallback"></a>

## ParallelObjectCallback(allDone, results)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| allDone | <code>Boolean</code> | it always be true |
| results | <code>Object.&lt;String, ResultArray&gt;</code> |  |

