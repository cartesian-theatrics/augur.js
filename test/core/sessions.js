/**
 * augur.js tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var abi = require("augur-abi");
var augur = require("../../src");
var constants = require("../../src/constants");
var utils = require("../../src/utilities");

describe("sessions", function () {

    var tx, api, getLogs;

    before(function () {
        api = augur.api;
        tx = augur.tx;
        getLogs = augur.rpc.getLogs;
        augur.api = new require("augur-contracts").Tx("2");
        augur.tx = augur.api.functions;
    });

    after(function () {
        augur.api = api;
        augur.tx = tx;
        augur.rpc.getLogs = getLogs;
    });

    describe("parseLastTime: parse last time from session logs", function () {
        var test = function (t) {
            it(t.description, function () {
                t.assertions(augur.parseLastTime(t.logs));
            });
        };
        test({
            description: "1 session log",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.strictEqual(output.getTime(), 1473976053000);
            }
        });
        test({
            description: "2 session logs",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.strictEqual(output.getTime(), 1473976086000);
            }
        });
    });

    describe("getLatestUserTime: look up user's most recent logout, login, or register timestamp", function () {
        var test = function (t) {
            var getLastLogoutTime;
            var getLastLoginTime;
            var getRegisterTime;
            before(function () {
                getLastLogoutTime = augur.getLastLogoutTime;
                getLastLoginTime = augur.getLastLoginTime;
                getRegisterTime = augur.getRegisterTime;
            });
            after(function () {
                augur.getLastLogoutTime = getLastLogoutTime;
                augur.getLastLoginTime = getLastLoginTime;
                augur.getRegisterTime = getRegisterTime;
            });
            it(t.description, function (done) {
                augur.getLastLogoutTime = function (account, options, callback) {
                    var lastLogoutTime = t.timestamps.logout && new Date(t.timestamps.logout);
                    if (!callback) return lastLogoutTime;
                    callback(null, lastLogoutTime);
                };
                augur.getLastLoginTime = function (account, options, callback) {
                    var lastLoginTime = t.timestamps.login && new Date(t.timestamps.login);
                    if (!callback) return lastLoginTime;
                    callback(null, lastLoginTime);
                };
                augur.getRegisterTime = function (account, options, callback) {
                    var registerTime = t.timestamps.register && new Date(t.timestamps.register);
                    if (!callback) return registerTime;
                    callback(null, registerTime);
                };
                augur.getLatestUserTime(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getLatestUserTime(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "no timestamps",
            account: "0xbob",
            timestamps: {
                logout: null,
                login: null,
                register: null
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.isNull(output.sync);
                assert.isNull(output.async);
            }
        });
        test({
            description: "register-only",
            account: "0xbob",
            timestamps: {
                logout: null,
                login: null,
                register: new Date(1473976051000)
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976051000);
            }
        });
        test({
            description: "register -> login",
            account: "0xbob",
            timestamps: {
                logout: null,
                login: new Date(1473976052000),
                register: new Date(1473976051000)
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976052000);
            }
        });
        test({
            description: "register -> logout",
            account: "0xbob",
            timestamps: {
                logout: new Date(1473976053000),
                login: null,
                register: new Date(1473976051000)
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "login -> logout",
            account: "0xbob",
            timestamps: {
                logout: new Date(1473976053000),
                login: new Date(1473976052000),
                register: null
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "logout -> login",
            account: "0xbob",
            timestamps: {
                logout: new Date(1473976052000),
                login: new Date(1473976053000),
                register: null
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "register -> login -> logout",
            account: "0xbob",
            timestamps: {
                logout: new Date(1473976053000),
                login: new Date(1473976052000),
                register: new Date(1473976051000)
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "register -> logout -> login",
            account: "0xbob",
            timestamps: {
                logout: new Date(1473976052000),
                login: new Date(1473976053000),
                register: new Date(1473976051000)
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "logout -> login -> register",
            account: "0xbob",
            timestamps: {
                logout: new Date(1473976052000),
                login: new Date(1473976053000),
                register: new Date(1473976054000)
            },
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
    });

    describe("getLastLoginTime: look up user's most recent login timestamp", function () {
        var test = function (t) {
            it(t.description, function (done) {
                augur.rpc.getLogs = function (filter, callback) {
                    if (!callback) return t.logs;
                    callback(t.logs);
                };
                augur.getLastLoginTime(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getLastLoginTime(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "no logins",
            account: "0xbob",
            logs: [],
            assertions: function (output) {
                assert.isObject(output);
                assert.isNull(output.sync);
                assert.isNull(output.async);
            }
        });
        test({
            description: "1 login",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "2 logins",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976086000);
            }
        });
    });

    describe("getLastLogoutTime: look up user's most recent logout timestamp", function () {
        var test = function (t) {
            it(t.description, function (done) {
                augur.rpc.getLogs = function (filter, callback) {
                    if (!callback) return t.logs;
                    callback(t.logs);
                };
                augur.getLastLogoutTime(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getLastLogoutTime(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "no logouts",
            account: "0xbob",
            logs: [],
            assertions: function (output) {
                assert.isObject(output);
                assert.isNull(output.sync);
                assert.isNull(output.async);
            }
        });
        test({
            description: "1 logout",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "2 logouts",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000003"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000003"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976086000);
            }
        });
    });

    describe("getRegisterTime: look up user's most recent register timestamp", function () {
        var test = function (t) {
            it(t.description, function (done) {
                augur.rpc.getLogs = function (filter, callback) {
                    if (!callback) return t.logs;
                    callback(t.logs);
                };
                augur.getRegisterTime(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getRegisterTime(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "no registers",
            account: "0xbob",
            logs: [],
            assertions: function (output) {
                assert.isObject(output);
                assert.isNull(output.sync);
                assert.isNull(output.async);
            }
        });
        test({
            description: "1 register",
            account: "0xb0b",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976053000);
            }
        });
        test({
            description: "2 registers",
            account: "0xb0b",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.strictEqual(output.sync.constructor, Date);
                assert.strictEqual(output.async.constructor, Date);
                assert.strictEqual(output.sync.getTime(), output.async.getTime());
                assert.strictEqual(output.async.getTime(), 1473976086000);
            }
        });
    });

    describe("getRegisterLogs", function () {
        var test = function (t) {
            it(t.description, function (done) {
                augur.rpc.getLogs = function (filter, callback) {
                    if (!callback) return t.logs;
                    callback(t.logs);
                };
                augur.getRegisterLogs(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getRegisterLogs(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "1 session log",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.isArray(output.sync);
                assert.isArray(output.async);
                assert.deepEqual(output.sync, output.async);
                var expected = [{
                    data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000001"
                    ]
                }];
                assert.strictEqual(output.sync.length, expected.length);
                assert.strictEqual(output.async.length, expected.length);
                assert.deepEqual(output.async, expected);
            }
        });
        test({
            description: "2 session logs",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.isArray(output.sync);
                assert.isArray(output.async);
                assert.deepEqual(output.sync, output.async);
                var expected = [{
                    data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000001"
                    ]
                }, {
                    data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000001"
                    ]
                }];
                assert.strictEqual(output.sync.length, expected.length);
                assert.strictEqual(output.async.length, expected.length);
                assert.deepEqual(output.async, expected);
            }
        });
    });

    describe("getLoginLogs", function () {
        var test = function (t) {
            it(t.description, function (done) {
                augur.rpc.getLogs = function (filter, callback) {
                    if (!callback) return t.logs;
                    callback(t.logs);
                };
                augur.getLoginLogs(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getLoginLogs(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "1 session log",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.isArray(output.sync);
                assert.isArray(output.async);
                assert.deepEqual(output.sync, output.async);
                var expected = [{
                    data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000002"
                    ]
                }];
                assert.strictEqual(output.sync.length, expected.length);
                assert.strictEqual(output.async.length, expected.length);
                assert.deepEqual(output.async, expected);
            }
        });
        test({
            description: "2 session logs",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000002"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.isArray(output.sync);
                assert.isArray(output.async);
                assert.deepEqual(output.sync, output.async);
                var expected = [{
                    data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000002"
                    ]
                }, {
                    data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000002"
                    ]
                }];
                assert.strictEqual(output.sync.length, expected.length);
                assert.strictEqual(output.async.length, expected.length);
                assert.deepEqual(output.async, expected);
            }
        });
    });

    describe("getLogoutLogs", function () {
        var test = function (t) {
            it(t.description, function (done) {
                augur.rpc.getLogs = function (filter, callback) {
                    if (!callback) return t.logs;
                    callback(t.logs);
                };
                augur.getLogoutLogs(t.account, t.options, function (err, timestamp) {
                    assert.isNull(err);
                    t.assertions({
                        async: timestamp,
                        sync: augur.getLogoutLogs(t.account, t.options)
                    });
                    done();
                });
            });
        };
        test({
            description: "1 session log",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000003"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.isArray(output.sync);
                assert.isArray(output.async);
                assert.deepEqual(output.sync, output.async);
                var expected = [{
                    data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000003"
                    ]
                }];
                assert.strictEqual(output.sync.length, expected.length);
                assert.strictEqual(output.async.length, expected.length);
                assert.deepEqual(output.async, expected);
            }
        });
        test({
            description: "2 session logs",
            account: "0xbob",
            logs: [{
                data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000003"
                ]
            }, {
                data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                topics: [
                    "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                    "0x0000000000000000000000000000000000000000000000000000000000000003"
                ]
            }],
            assertions: function (output) {
                assert.isObject(output);
                assert.isArray(output.sync);
                assert.isArray(output.async);
                assert.deepEqual(output.sync, output.async);
                var expected = [{
                    data: "0x0000000000000000000000000000000000000000000000000000000057db16f5",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000003"
                    ]
                }, {
                    data: "0x0000000000000000000000000000000000000000000000000000000057db1716",
                    topics: [
                        "0x19a49d2acfeb2c56bc742081b752ef527725fe0253f511d34d5364668b4475fe",
                        "0x0000000000000000000000000000000000000000000000000000000000000b0b",
                        "0x0000000000000000000000000000000000000000000000000000000000000003"
                    ]
                }];
                assert.strictEqual(output.sync.length, expected.length);
                assert.strictEqual(output.async.length, expected.length);
                assert.deepEqual(output.async, expected);
            }
        });
    });
});