'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.route('/').get(function (req, res) {
    console.log('get cat');
    res.send('get cat');
}).put(function (req, res) {
    console.log('put cat');
}).delete(function (req, res) {
    console.log('delete cat');
});

exports.default = router;