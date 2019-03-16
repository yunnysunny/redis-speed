<a name="FlashCachRedis"></a>

## FlashCachRedis
FlashCachRedis

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
```javascript