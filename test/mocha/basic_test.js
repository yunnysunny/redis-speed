const Redis = require('ioredis');
const {expect} = require('chai');
const FlashCacheRedis = require('../index');
const redisClient = new Redis();//connect to the redis server of localhost:6379
const INTERVAL = 1000;
const redisAdapter = new FlashCacheRedis({
    redisClient,//the redis client object
    interval:INTERVAL
});
const KEY = 'flash_cache_redis:basic';
const VALUE = {name:'sunny',id:1};
const VALUE_UPDATE = {name:'sunny_new',id:1};

describe('basic test',function() {
    it ('should set redis success',function(done) {
        redisClient.set(KEY,VALUE,function(err) {//save session
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it ('should get success',function(done) {
        redisAdapter.get(KEY,function(err,obj) {
            if (err) {
                return done(err);
            }
            expect(obj).to.have.property('name').and.equal(VALUE.name);
            done();
        });
    });

    // it('should update success',function(done) {
    //     sessionToken.update(token,VALUE_UPDATE,function(err) {
    //         if (err) {
    //             return done(err);
    //         }
    //         done();
    //     });
    // });
});