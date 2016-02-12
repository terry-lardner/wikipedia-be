var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

var Article = require('../models/articles');


//Get article
router.get('/', function(req, res) {
	console.log('Connection established to Wikipedia-fe.');
	Article.find(function(err, articles) {
		res.send(articles);
	});
});

router.get('/test', function(req, res) {
	console.log('Connection established to Wikipedia-fe.');
	res.sendStatus(200);
});


//Get article
router.get('/:title', function(req, res) {
	Article.findOne({title: req.params.title}, function(err, article){
		if (err) {
			return res.send(err);
		}

		res.send(article);
	});
});

//POST new Article
router.post('/saveArticle',function(req, res) {

	//Build object from form data
	var newArticle = {
		title : req.body.title,
		content : req.body.content,
		contentFeat : req.body.contentFeat,
		featured: req.body.featured, 
		imageUrl : req.body.imageUrl
	};

	//Save to db
	new Article(newArticle)
	.save(function(err, data) {		
		if (err) {
			return res.send(err);			
		}
		res.send(data);
	});
});


//REMOVE a user 
router.delete('/delete/:title', function(req, res) {

	Article.remove({
		_id: req.params.id
	}, function(err) {
		if (err) {
			return res.send(err);
		}
		res.sendStatus(200);
	});
});

//UPDATE an article
router.put('/updateArticle/:title',function(req, res) {

	//Get article
	Article.findOne({title: req.params.title}, function(err, article){
		if (err) {
			return res.send(err);
		}

		article.content = req.body.content;
		article.contentFeat = req.body.contentFeat;
		article.featured = req.body.featured;
		article.imageUrl = req.body.imageUrl;

		//Save to db
		article.save(function(err, data) {
			if (err) {
				return res.send("Error saving to database!!");
			} 
			res.send(data);
		});
	});
});

//UPDATE an article feat
router.put('/updateFeat/:id',function(req, res) {

	//Get article
	Article.findOne({_id: req.params.id}, function(err, article){
		if (err) {
			return res.send(err);
		}

		article.contentFeat = req.body.contentFeat;



		//Save to db
		article.save(function(err, data) {
			if (err) {
				return res.send("Error saving to database!!");
			} 
			res.send(data);
		});
	});
});

module.exports = router;