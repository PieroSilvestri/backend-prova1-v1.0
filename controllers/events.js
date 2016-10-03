var express = require('express')
  , router = express.Router();

var mysql = require('mysql');
var async = require('async');

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

			var tags;
			var body;
			var results = [];

			var query1 = "SELECT events.EVENT_ID, EVENT_NAME, EVENT_PLACE, EVENT_DATE, EVENT_SEATS, EVENT_AVAIABLE_SEATS, "
				+ "EVENT_ADMINISTRATOR_ID, EVENT_IMAGE, EVENT_DESCRIPTION, EVENT_LATLON, users.USER_NAME AS ADMIN_NAME, "
				+ "users.USER_SURNAME AS ADMIN_SURNAME, users.USER_USERNAME AS ADMIN_USERNAME, "
				+ "tags.TAGS_NAME, tags.TAGS_ID FROM events "
				+ "JOIN users ON events.EVENT_ADMINISTRATOR_ID = users.USER_ID "
				+ "JOIN tags_events ON events.EVENT_ID = tags_events.EVENT_ID "
				+ "JOIN tags ON tags_events.TAG_ID = tags.TAGS_ID";

			var query2 = "SELECT * FROM events";

			var query = "SELECT EVENT_ID, EVENT_NAME, EVENT_PLACE, EVENT_DATE, EVENT_SEATS, EVENT_AVAIABLE_SEATS, "
				+ "EVENT_ADMINISTRATOR_ID, EVENT_IMAGE, EVENT_DESCRIPTION, EVENT_LATLON, users.USER_NAME AS ADMIN_NAME, "
				+ "users.USER_SURNAME AS ADMIN_SURNAME, users.USER_USERNAME AS ADMIN_USERNAME FROM events "
				+ "JOIN users ON events.EVENT_ADMINISTRATOR_ID = users.USER_ID";

			tempCont.query(query, function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
					console.log(error)
					res.status(404).json({
						success: false,
						error: error,
						rows: rows,
						fields: fields
					});
				}else{

					var righe = rows;

					async.forEachOfSeries(righe, function(id, index, callback){

						var queryTags = "SELECT TAGS_ID, TAGS_NAME FROM tags "
							+ "JOIN tags_events ON tags.TAGS_ID = tags_events.TAG_ID "
							+ "JOIN events ON tags_events.EVENT_ID = events.EVENT_ID "
							+ "WHERE events.EVENT_ID = " + id.EVENT_ID;

						tempCont.query(queryTags, function(error, rows1, fields){
										if(!!error){
											console.log("Error in the queryTags");
											console.log(error)
										}else{
											if(rows1.length == 0){
												body = (righe[index]);
												tags = 0;
											}else{
												body = (righe[index]);
												tags = (rows1);
											}
											
											
										}

										results.push({body: body, tags: tags});

										callback();
						});
					}, function done(){

							console.log("finito")

							res.status(200).json({
							success: true,
							results: results
						});
					});
							
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

router.post('/upload', function(req, res){
	console.log(req.body);
	console.log(req.files);
	res.json(
	{
		success: true
	});
});

router.post('/add', function(req, res){

	if( !req.body.event_name || !req.body.event_place || !req.body.event_date ||
		!req.body.event_administrator_id || !req.body.event_description){
		return res.json({
			message: 'Control the body',
			error: true
		});
	}

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("INSERT INTO events (EVENT_NAME, EVENT_PLACE, EVENT_DATE, EVENT_SEATS, "
				+ "EVENT_AVAIABLE_SEATS, EVENT_ADMINISTRATOR_ID, EVENT_IMAGE, EVENT_DESCRIPTION, EVENT_LATLON) VALUES ('" 
							+ req.body.event_name + "', '" + req.body.event_place + "', '" + req.body.event_date +"', "
							+ parseInt(req.body.event_seats, 10) + ", " + parseInt(req.body.event_avaiable_seats, 10) + ", '"
							+ parseInt(req.body.event_administrator_id, 10) +"', '" + req.body.event_image +"', '" 
							+ req.body.event_desctiption +"', '" + req.body.event_latlon +"');", 
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

router.get('/tags/get', function(req, res){
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			var query = "SELECT TAGS_ID, TAGS_NAME FROM tags "
				+ "JOIN tags_events ON tags.TAGS_ID = tags_events.TAG_ID "
				+ "JOIN events ON tags_events.EVENT_ID = events.EVENT_ID";

			tempCont.query(query, function(error, rows, fields){
								tempCont.release();
								if(!!error){
									console.log('Error in the query');
									console.log(error)
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

router.get('/:eventid', function(req, res){
	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');
			tempCont.query("SELECT * FROM events WHERE EVENT_ID = " + parseInt(req.params.eventid, 10), function(error, rows, fields){
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

router.post('/users', function(req, res){

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

// TAGS-EVENTS INTERACTION



router.post('/tags/add', function(req, res){

	var righe = [];

	if(!req.body.tags || !req.body.event_id){
		return res.json({
			message: 'Missing event or tag id',
			error: true
		});
	}

	connection.getConnection(function(error, tempCont){
		if(!!error){
			tempCont.release();
			console.log('Error');
		}else{
			console.log('Connected');

			async.forEachOfSeries(req.body.tags, function(id, index, callback){
				var my_query = "INSERT INTO tags_events (TAG_ID, EVENT_ID) VALUES ("
					+ parseInt(id) + ", " + parseInt(req.body.event_id, 10) + ");";

				tempCont.query(my_query, function(error, rows, fields){
								if(!!error){
									console.log('Error in the query');
								}else{
									if(rows.length == 0){
										return res.json({
											message: "Utente non trovato",
											error: true
										})
									}else{
										righe.push(
										{
											tag_id: id,
											event_id: req.body.event_id
										});
									}
								}

								callback();
				});
			}, function done(){
					res.status(200).json({
					success: true,
					rows: righe
				});
			});


			
			
		}
	});

});

module.exports = router;