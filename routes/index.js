var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

var Article = require('../models/articles');

var interval = 5; //minutes

//Get article
router.get('/', function(req, res) {
	Article.find(function(err, articles) {
		res.send(articles);
	});

});

router.get('/feat', function(req, res) {
	
	//Get all yet-to-be featured articles.	
	Article.findOne({featured:true, featuredDate: {$gt:55}}, function(err, article) {
		res.send(article);
	});
});

router.get('/test', function(req, res) {
	console.log('Connection established to Wikipedia-fe.');
	res.sendStatus(200);
});


//Get article
router.get('/:title', function(req, res) {
	Article.findOne({title: req.params.title}, function(err, articles){
		if (err) {
			return res.send(err);
		}

		res.send(articles);
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

//Logic: Every x minutes set a new article to be featured based on the feature date.
var switchFeatured = setInterval(cycleFeaturedArticles, interval * 60 * 1000);

function recycleFeatured() {
	Article.find({featuredDate: 55}, function(err, articles) {
		for(var i=0; i<articles.length; i++) {
			articles[i].featuredDate = 0;

			//Save to db
			articles[i].save(function(err, data) {
				if (err) {
					return res.send("Error saving to database!!");
				} 
			});
		}
	});
}

function cycleFeaturedArticles() {
	console.log('Calculating new featured article...');
	
	//Get any active featured article not yet 'expired'
	Article.findOne({featuredDate: {$gt:55}}, function(err, article) {
		if (article) {
			console.log('FOUND CURRENT featured article: [' + article.title + ']');
			article.featuredDate = 55 //55 - article already featured;

			//Save to db
			article.save(function(err, data) {
				if (err) {
					return res.send("Error saving to database!!");
				} 
			});
		} else {
			console.log('No active featured articles found.');
		}
	});

	//Get the next article to be featured
	Article.findOne({featured:true, featuredDate: 0}, function(err, article) {
		if (article) {
			console.log('FOUND NEXT featured article: [' + article.title + ']');
			article.featuredDate = Date.now();

			//Save to db
			article.save(function(err, data) {
				if (err) {
					return res.send("Error saving to database!!");
				} 
			});
		} else {
			//Optional recycle all featured articles if no new ones remain
			console.log('No unfeatured articles remaining....recycling..');
			recycleFeatured();
		}
	});
}

module.exports = router;