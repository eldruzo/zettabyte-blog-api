/*
    articles structures
        _id : ObjectID(id)
        title: String
        text: String

    comments structures
        _id: ObjectID(id)
        post_id: String
        name: String,
        email: String,
        message: String,

*/

const express = require('express');
const app = express();
const cors = require('cors');

const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb');
const MongoConnectionString = 'mongodb+srv://nabil:jH5oLdn4CMzFT9lu@cluster0.n7fwq.mongodb.net/book-app?retryWrites=true&w=majority'

MongoClient.connect(MongoConnectionString, {
    useUnifiedTopology: true
})
    .then(client => {
        const db = client.db('blog-app');
        const articlesCollection = db.collection('articles');
        const commentsCollection = db.collection('comments');

        //server use
        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: true }));

        // route the index.html
        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/pages/index.html');
        });

        // Get all articles
        app.get('/articles', (req, res) => {
            articlesCollection.find().toArray()
                .then(results => 
                    res.json(
                       results.map((result) => ({
                            post_id: result._id,
                            uploaded: ObjectID(result._id).getTimestamp(),
                            title: result.title,
                            text: result.text
                       }))   
                    )
                )
                .catch(err => res.json(err))
        });

        // post one article by id
        app.post('/articles', (req, res) => {
            articlesCollection.insertOne(req.body)
                .then((results) => {
                    res.json({
                        status: 'success',
                        message: 'New post added',
                        data: {
                            postId: results.insertedId
                        }
                    });
                })
                .catch(err => res.json(err));
        });

        // get one article by id
        app.get('/articles/:id', (req, res) => {
            articlesCollection.findOne({_id: ObjectID(req.params.id)})
                .then(result => 
                    res.json({
                        post_id: result._id,
                        uploaded: ObjectID(result._id).getTimestamp(),
                        title: result.title,
                        text: result.text
                    })
                )
                .catch(err => res.json(err));
        });

        // update one article by id
        app.put('/articles/:id', (req, res) => {
            articlesCollection.findOneAndUpdate(
                {_id: ObjectID(req.params.id)},
                {
                    $set: {
                        title: req.body.title,
                        text: req.body.text
                    }
                },
                {
                    upsert: true
                }
            )
                .then((results) => {
                    res.json({
                        status: 'success',
                        message: 'post updated',
                        data: {
                            postId: results.modifiedCount
                        }
                    })
                })
                .catch(err => res.json(err));
        });

        // delete one article
        app.delete('/articles/:id', (req, res) => {
            articlesCollection.deleteOne({_id: ObjectID(req.params.id)})
                .then((results) => {
                    res.json({
                        status: 'success',
                        message: 'post deleted',
                        data: {
                            postId: results.deletedCount
                        }
                    })
                })
                .catch(err => res.json(err));
        });

        // post one comment
        app.post('/comments', (req, res) => {
            commentsCollection.insertOne(req.body)
                .then((results) => {
                    res.json({
                        status: 'success',
                        message: 'New comments added',
                        data: {
                            commentsId: results.insertedId
                        }
                    });
                })
                .catch(err => res.json(err));
        });

        // get one comment by id
        app.get('/comments/:id', (req, res) => {
            commentsCollection.findOne({_id: ObjectID(req.params.id)})
                .then(result => 
                    res.json({
                        comments_id: result._id,
                        post_id: result.post_id,
                        posted: ObjectID(result._id).getTimestamp(),
                        name: result.name,
                        email: result.email,
                        message: result.message
                    })
                )
                .catch(err => res.json(err));
        });

        // get all comments by post id
        app.get('/comments/post/:postid', (req, res) => {
            commentsCollection.find({post_id: req.params.postid}).toArray()
                .then(results => 
                    res.json(
                        results.map(result => ({
                            comments_id: result._id,
                            post_id: result.post_id,
                            posted: ObjectID(result._id).getTimestamp(),
                            name: result.name,
                            email: result.email,
                            message: result.message
                        }))
                    )
                )
                .catch(err => res.json(err));
        });

        // update one comment by id
        app.put('/comments/:id', (req, res) => {
            commentsCollection.findOneAndUpdate(
                {_id: ObjectID(req.params.id)},
                {
                    $set: {
                        message: req.body.message
                    }
                }
            )
                .then((results) => {
                    res.json({
                        status: 'success',
                        message: 'comments message updated',
                        data: {
                            commentId: results.modifiedCount
                        }
                    })
                })
                .catch(err => res.json(err));
        });

        // delete one comment by id
        app.delete('/comments/:id', (req, res) => {
            commentsCollection.deleteOne({_id: ObjectID(req.params.id)})
                .then((results) => {
                    res.json({
                        status: 'success',
                        message: 'comment deleted',
                        data: {
                            commentId: results.deletedCount
                        }
                    })
                })
                .catch(err => res.json(err));
        });

        //list to port 3000
        app.listen(3000);
    })
    .catch((err) => {
        console.log(`Application Error : ${err}`);
    });

