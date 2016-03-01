var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

var Article = require('../models/articles');

var interval = 5; //minutes

//Get all articles
router.get('/', function(req, res) {
	Article.find(function(err, articles) {
		res.send(articles);
	});

});

//Get list of articles by title
router.get('/search/:query', function(req, res) {
	var query = req.params.query.split('&');
	var queryTitle = query[0].substring(2);
	var queryArr;
	var regex;

	if (queryTitle.indexOf('\"') > -1) {
		queryTitle = queryTitle
						.replace(/\+/g, '_')
						.replace(/\"/g, '');
		regex = new RegExp(queryTitle); //Exact match to title
	} else {
		queryArr = queryTitle.split('+');
		regex = new RegExp(queryArr.join('|'), 'i'); //Match any terms in title
	}

	Article.find({title: {$in:regex}}, function(err, articles) {
		res.send(articles);
	});	
});

//Get all yet-to-be featured articles.	
router.get('/feat', function(req, res) {
	Article.findOne({featured:true, featuredDate: {$gt:55}}, function(err, article) {
		res.send(article);
	});
});

//This is purely for offline testing
router.get('/test', function(req, res) {
	console.log('Connection established to Wikipedia-fe.');
	res.sendStatus(200);
});


//Get article by title
router.get('/:title', function(req, res) {
	Article.findOne({title: req.params.title}, function(err, articles){
		if (err) {
			return res.send(err);
		}

		res.send(articles);
	});
});

//POST new Article
router.post('/saveArticle', function(req, res) {

	//Build object from form data
	var newArticle = {
		title : req.body.title,
		content : req.body.content,
		contentFeat : req.body.contentFeat,
		featured: req.body.featured, 
		imageUrl : req.body.imageUrl,
		featuredDate: req.body.featuredDate
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


//Delete an article
/*
router.delete('/delete/:title', function(req, res) {

	Article.remove({
		title: req.params.title
	}, function(err) {
		if (err) {
			return res.send(err);
		}
		res.sendStatus(200);
	});
});
*/

//UPDATE an article
router.put('/updateArticle/:title',function(req, res) {

	//Get article	
	var newArticle = {
		content: req.body.content,
		contentFeat: req.body.contentFeat,
		featured: req.body.featured,
		imageUrl: req.body.imageUrl	
	}		

	Article.findOneAndUpdate({title: req.params.title}, newArticle, {new: true}, function(err, article){
		if (err) {
			return res.send("Error updating article [" + err + "]");
		}

		res.send(article);
	});
});

//Logic: Every x minutes set a new article to be featured based on the feature date.
var switchFeatured = setInterval(cycleFeaturedArticles, interval * 60 * 1000);

function recycleFeatured() {
	Article.find({featuredDate: 55}, function(err, articles) {
		for(var i=0; i<articles.length; i++) {
			articles[i].featuredDate = 0;

			//Save to db
			articles[i].save(function(err, data) {
				if (err) {
					console.log("Error recycling featured articles [" + err + "]");
				} 
			});
		}
	});
}

function cycleFeaturedArticles() {
	console.log('Calculating new featured article...');

	var newArticle = {
		featuredDate: 55
	}
	
	//Expire the article currently being featured
	Article.findOneAndUpdate({featuredDate: {$gt:55}}, newArticle, {new:true, upsert: false}, function(err, article){
		if (err) {
			console.log('Error expiring featured article [' + err + ']');
		}

		if (article) {
			console.log('Expired CURRENT featured article: [' + article.title + '] [' + article.featuredDate + "]");
		} else {
			console.log('No active featured articles found.');
		}	
	});

	newArticle = {
		featuredDate: Date.now()
	}

	//Set the next article to be featured
	Article.findOneAndUpdate({featured:true, featuredDate: 0}, newArticle, {new:true, upsert: false}, function(err, article){
		if (err) {
			console.log('Error setting next featured article [' + err + ']');
		}

		if (article) {
			console.log('Retrieved NEXT featured article: [' + article.title + '] [' + article.featuredDate + ']');
		} else {
			//Optional recycle all featured articles if no new ones remain
			console.log('No unfeatured articles remaining....recycling..');
			recycleFeatured();
		}	
	});
}

module.exports = router;