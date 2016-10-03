var express = require('express')
  , router = express.Router();

var path = "/api/v3";

router.use(path + '/users', require('./users'));
router.use(path + '/tags', require('./tags'));
router.use(path + '/events', require('./events'));
  
module.exports = router;