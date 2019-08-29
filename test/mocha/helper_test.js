const Redis = require('ioredis');
const {expect} = require('chai');
const async  = require('neo-async');
var mocha = require('mocha');
var describe = mocha.describe;
var it = mocha.it;
const {RedisHelper} = require('../../index');
const redisClient = new Redis();//connect to the redis server of localhost:6379
const redisHelper = new RedisHelper({redisClient});

describe('helper test#', function() {
    it('do parallel in array',function(done) {
        const key1 = 'key1';
        const value1 = Math.random() + '';
        const key2 = 'key2';
        const value2 = Math.random() + '';
        async.waterfall([
            function(next) {
                const tasks = [
                    ['set',key1,value1],
                    ['set',key2,value2]
                ];
                redisHelper.doParallelJobs(tasks,function(none,[[err1],[err2]]) {
                    expect(err1).to.be.null;
                    expect(err2).to.be.null;
                    next();
                });
            },
            function(next) {
                const tasks = [
                    ['get',key1],
                    ['get',key2]
                ];
                redisHelper.doParallelJobs(tasks,function(none,[[err1,reply1],[err2,reply2]]) {
                    expect(err1).to.be.null;
                    expect(err2).to.be.null;
                    expect(reply1).to.be.equal(value1);
                    expect(reply2).to.be.equal(value2);
                    next();
                });
            }
        ],done);
        
    });

    it('do parallel in object',function(done) {
        const key1 = 'key1';
        const value1 = Math.random() + '';
        const key2 = 'key2';
        const value2 = Math.random() + '';
        async.waterfall([
            function(next) {
                const tasks = {
                    set1: ['set',key1,value1],
                    set2: ['set',key2,value2]
                };
                redisHelper.doParallelJobs(tasks,function(none,{
                    set1:[err1],
                    set2:[err2]
                }) {
                    expect(err1).to.be.null;
                    expect(err2).to.be.null;
                    next();
                });
            },
            function(next) {
                const tasks = {
                    get1:['get',key1],
                    get2:['get',key2]
                };
                redisHelper.doParallelJobs(tasks,function(none,{
                    get1:[err1,reply1],
                    get2:[err2,reply2]
                }) {
                    expect(err1).to.be.null;
                    expect(err2).to.be.null;
                    expect(reply1).to.be.equal(value1);
                    expect(reply2).to.be.equal(value2);
                    next();
                });
            }
        ],done);
        
    });

    it('do parallel with empty',function(done) {
        const key1 = 'key1';
        const value1 = Math.random() + '';
        const key2 = 'key2';
        const value2 = Math.random() + '';
        async.waterfall([
            function(next) {
                const tasks = [
                    ['set',key1,value1],
                    [RedisHelper.EMPTY_FUN],
                    ['set',key2,value2],
                ];
                redisHelper.doParallelJobs(tasks,function(none,[[err1],[errn],[err2]]) {
                    expect(err1).to.be.null;
                    expect(err2).to.be.null;
                    next();
                });
            },
            function(next) {
                const tasks = [
                    ['get',key1],
                    ['get',key2],
                    [RedisHelper.EMPTY_FUN],
                ];
                redisHelper.doParallelJobs(tasks,function(none,[[err1,reply1],[err2,reply2]]) {
                    expect(err1).to.be.null;
                    expect(err2).to.be.null;
                    expect(reply1).to.be.equal(value1);
                    expect(reply2).to.be.equal(value2);
                    next();
                });
            }
        ],done);
        
    });
});

