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
			tempCont.query("SELECT * FROM users", function(error, rows, fields){
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

router.post('/login', function(req, res){

	if(!req.body.user_username && !req.body.user_password){
		return res.json({
			message: 'Missing username',
			error: true
		});
	}
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("SELECT USER_ID, USER_NAME, USER_SURNAME, USER_EMAIL, USER_USERNAME FROM users "
				+ "WHERE USER_USERNAME = '" + req.body.user_username + "' AND USER_PASSWORD = '" + req.body.user_password + "'", function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				}else{
					if(rows.length == 0){
						return res.json({
							message: "Utente non trovato",
							error: true
						})
					}
					res.status(200).json({
						success: true,
						body: rows
						});
				}
			})
		}
	});

});

router.post('/add', function(req, res){

	if(!req.body.user_username || !req.body.user_password){
		return res.json({
			message: 'Missing username',
			error: true
		});
	}

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("INSERT INTO users (USER_NAME, USER_SURNAME, USER_USERNAME, USER_EMAIL, USER_PASSWORD) VALUES ('" 
							+ req.body.user_name + "', '" + req.body.user_surname + "', '" + req.body.user_username +"', '"
							+ req.body.user_email +"', '" + req.body.user_password + "');", 
							function(error, rows, fields){
								tempCont.release();
								if(!!error){
									console.log('Error in the query');
								}else{
									if(rows.length == 0){
										return res.json({
											message: "Utente non trovato",
											error: true
										})
									}
									res.status(200).json({
										success: true,
										body: rows
										});
								}
			})
		}
	});

});

router.put('/:userid', function(req, res){
	for(var i = 0; i < global.users.length; i++){
		if(global.users[i].id === parseInt(req.params.userid, 10)){
			global.users[i].name = req.body.name;
			global.users[i].hobby = req.body.hobby;
			return res.json({
				message: 'Success put',
				error: false
			});
		}
	}
	return res.status(404).json({
		message:'User not found',
		error: true
	})
});

router.delete('/:userid', function(req, res){
	for(var i = 0; i < global.users.length; i++){
		if(global.users[i].id === parseInt(req.params.userid, 10)){
			global.users.splice(i, 1);
			return res.json({
				message: 'Success delete',
				error: false
			});
		}
	}
	return res.status(404).json({
		message:'User not found',
		error: true
	});
});

router.get('/:userid', function(req, res){
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("SELECT * FROM users WHERE USER_ID = " + parseInt(req.params.userid, 10), function(error, rows, fields){
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


// USER-EVENTS INTERACTION

router.post('/events', function(req, res){

	if(!req.body.user_id || !req.body.event_id){
		return res.json({
			message: 'Missing event or user id',
			error: true
		});
	}

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("INSERT INTO users_events (USER_ID, EVENT_ID) VALUES (" 
							+ parseInt(req.body.user_id, 10) + ", " + parseInt(req.body.event_id, 10) + ");", 
							function(error, rows, fields){
								tempCont.release();
								if(!!error){
									console.log('Error in the query');
								}else{
									if(rows.length == 0){
										return res.json({
											message: "Utente non trovato",
											error: true
										})
									}
									res.status(200).json({
										success: true,
										body: rows
										});
								}
			})
		}
	});

});

module.exports = router;