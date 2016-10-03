var express = require('express')
  , router = express.Router();

var mysql = require('mysql');
var connection = mysql.createPool({
// Properties
	connectionLimit: 50,
	host: 'localhost',
	user: 'root',
	password: 'password1',
	database: 'test2'
});

router.get('/', function(req, res){

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("SELECT * FROM tags", function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				}else{
					res.json(rows);
				}
			})
		}
	});

	/*
	return res.json({
		users: global.users,
		error: false
	});
	*/
});

router.get('/:tagsid', function(req, res){
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("SELECT * FROM tags WHERE TAGS_ID = " + parseInt(req.params.tagsid, 10), function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				}else{
					res.json(rows);
				}
			})
		}
	});

});

module.exports = router;