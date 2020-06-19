const chai = require('chai');
const Redis = require('ioredis');
const expect = chai.expect;
const async = require('neo-async');
const {
    redisBatchIncr: {
        EVENT_ONE_LOOP_FINISHED,
        EVENT_SEND_ERROR,
        BatchHincr,
        BatchZincrby
    }
} = require('../../');
const redisClient = new Redis();//connect to the redis server of localhost:6379

const LOOP_COUNT = 100;
const INTERVAL = 200;
describe('batch incr test', function() {
    it('hincr single memeber in single key',function(done) {
        const key = ('test:' + Math.random()).replace('.','');
        const cmd = new BatchHincr({redisClient,loopInterval:INTERVAL,key});
        
        cmd.on(EVENT_ONE_LOOP_FINISHED,function(len) {
            if (len !== 1) {
                return;
            }
            redisClient.hget(key,'name',function(err,reply) {
                if (err) {
                    return done(err);
                }
                expect(Number(reply)).to.be.equal(LOOP_COUNT);
                done();
            });
        });
        cmd.on(EVENT_SEND_ERROR,function(err) {
            done(err);
        });
        
        for(var i=0;i<LOOP_COUNT;i++) {
            cmd.addData(1,'name');
        }

    });

    it('hincr multiple memebers in single key',function(done) {
        const key = ('test:' + Math.random()).replace('.','');
        const cmd = new BatchHincr({redisClient,loopInterval:INTERVAL,key});
        
        cmd.on(EVENT_ONE_LOOP_FINISHED,function(len) {
            if (len !== LOOP_COUNT) {
                return;
            }
            async.times(LOOP_COUNT,function(index,next) {
                redisClient.hget(key,'name'+index,function(err,reply) {
                    if (err) {
                        return next(err);
                    }
                    expect(Number(reply)).to.be.equal(1);
                    next();
                });
            },done);
        });
        cmd.on(EVENT_SEND_ERROR,function(err) {
            done(err);
        });
       
        for(var i=0;i<LOOP_COUNT;i++) {
            cmd.addData(1,'name'+i);
        }
    });

    it('hincr multiple members of multiple keys',function(done) {
        const key = ('test:' + Math.random()).replace('.','');
        const cmd = new BatchHincr({redisClient,loopInterval:INTERVAL,key});
        
        const INNER_LOOP_COUNT = 10;
        const SCORE = 3;
        cmd.on(EVENT_ONE_LOOP_FINISHED,function(len) {
            if (len !== LOOP_COUNT) {
                return;
            }
            async.times(LOOP_COUNT,function(index,next) {
                redisClient.hget(key,'name'+index,function(err,reply) {
                    if (err) {
                        return next(err);
                    }
                    expect(Number(reply)).to.be.equal(SCORE*INNER_LOOP_COUNT);
                    next();
                });
            },done);
        });
        cmd.on(EVENT_SEND_ERROR,function(err) {
            done(err);
        });
       
        for(var i=0;i<LOOP_COUNT;i++) {
            for (var j=0;j<INNER_LOOP_COUNT;j++) {
                cmd.addData(SCORE,'name'+i);
            }
        }
    });

    it('zincr single memeber in single key',function(done) {
        const key = ('test:' + Math.random()).replace('.','');
        const cmd = new BatchZincrby({redisClient,loopInterval:INTERVAL,key});
        
        cmd.on(EVENT_ONE_LOOP_FINISHED,function(len) {
            if (len !== 1) {
                return;
            }
            redisClient.zscore(key,'name',function(err,reply) {
                if (err) {
                    return done(err);
                }
                expect(Number(reply)).to.be.equal(LOOP_COUNT);
                done();
            });
        });
        cmd.on(EVENT_SEND_ERROR,function(err) {
            done(err);
        });
        
        for(var i=0;i<LOOP_COUNT;i++) {
            cmd.addData(1,'name');
        }

    });

    it('zincr multiple members in single key',function(done) {
        const key = ('test:' + Math.random()).replace('.','');
        const cmd = new BatchZincrby({redisClient,loopInterval:INTERVAL,key});
        
        cmd.on(EVENT_ONE_LOOP_FINISHED,function(len) {
            if (len !== LOOP_COUNT) {
                return;
            }
            async.times(LOOP_COUNT,function(index,next) {
                redisClient.zscore(key,'name'+index,function(err,reply) {
                    if (err) {
                        return next(err);
                    }
                    expect(Number(reply)).to.be.equal(1);
                    next();
                });
            },done);
        });
        cmd.on(EVENT_SEND_ERROR,function(err) {
            done(err);
        });
       
        for(var i=0;i<LOOP_COUNT;i++) {
            cmd.addData(1,'name'+i);
        }
    });

    it('zincr multiple members of multiple keys',function(done) {
        const key = ('test:' + Math.random()).replace('.','');
        const cmd = new BatchZincrby({redisClient,loopInterval:INTERVAL,key});
        
        
        const INNER_LOOP_COUNT = 10;
        const SCORE = 3;
        cmd.on(EVENT_ONE_LOOP_FINISHED,function(len) {
            if (len !== LOOP_COUNT) {
                return;
            }
            async.times(LOOP_COUNT,function(index,next) {
                redisClient.zscore(key,'name'+index,function(err,reply) {
                    if (err) {
                        return next(err);
                    }
                    expect(Number(reply)).to.be.equal(SCORE*INNER_LOOP_COUNT);
                    next();
                });
            },done);
        });
        cmd.on(EVENT_SEND_ERROR,function(err) {
            done(err);
        });
       
        for(var i=0;i<LOOP_COUNT;i++) {
            for (var j=0;j<INNER_LOOP_COUNT;j++) {
                cmd.addData(SCORE,'name'+i);
            }
        }
    });
});