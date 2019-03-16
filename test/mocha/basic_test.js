const Redis = require('ioredis');
const {expect} = require('chai');
const sinon  = require('sinon');
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
const {FlashCacheRedis} = require('../../index');
const redisClient = new Redis();//connect to the redis server of localhost:6379
const INTERVAL = 1000;
const {cacheQueryAdapter} = new FlashCacheRedis({
    redisClient,//the redis client object
    interval:INTERVAL,
    useYoungOnly:true
});
const KEY = 'flash_cache_redis:basic';
const VALUE = {name:'sunny',id:1};

describe('basic test',function() {
    it ('should set redis success',function(done) {
        redisClient.set(KEY,JSON.stringify(VALUE),function(err) {//save session
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it ('should get success',function(done) {
        const redisGet = sinon.spy(redisClient,'get');
        cacheQueryAdapter.get(KEY,function(err,obj) {
            expect(redisGet.called).to.be.true;
            redisGet.restore();
            if (err) {
                return done(err);
            }
            try {
                obj = JSON.parse(obj);
            } catch (e) {
                return done(e);
            }
            expect(obj).to.have.property('name').and.equal(VALUE.name);
            done();
        });
    });

    it ('should get from memory success',function(done) {
        const redisGet = sinon.spy(redisClient,'get');
        cacheQueryAdapter.get(KEY,function(err,obj) {
            expect(redisGet.called).to.be.false;
            redisGet.restore();
            if (err) {
                return done(err);
            }
            try {
                obj = JSON.parse(obj);
            } catch (e) {
                return done(e);
            }
            expect(obj).to.have.property('name').and.equal(VALUE.name);
            done();
        });
    });

    it('delay',function(done) {
        setTimeout(function() {done();},INTERVAL+100);
    });

    it ('should get from redis success',function(done) {
        const redisGet = sinon.spy(redisClient,'get');
        cacheQueryAdapter.get(KEY,function(err,obj) {
            expect(redisGet.called).to.be.true;
            redisGet.restore();
            if (err) {
                return done(err);
            }
            try {
                obj = JSON.parse(obj);
            } catch (e) {
                return done(e);
            }
            expect(obj).to.have.property('name').and.equal(VALUE.name);
            done();
        });
    });
});