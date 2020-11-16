const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json())

favouriteRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favorite);
    },err=>next(err))
    .catch((err)=>next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        if(favorite){
            for (var i=req.body.length-1;i>=0;i--){
                if(favorite.dishes.indexOf(req.body[i]._id)===-1){
                    favorite.dishes.push(req.body[i]._id)
                }
            }
            favorite.save()
            .then((fav)=>{
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then((resp)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(resp);
                },err=>next(err))
                .catch((err)=>next(err))

            },err=>next(err))
            .catch((err)=>next(err))
        }
        else{
            Favorites.create({user:req.user._id})
            .then((fav)=>{
                for (var i=req.body.length-1;i>=0;i--){
                    fav.dishes.push(req.body[i]._id)
                }
                fav.save()
                .then((favi)=>{
                    Favorites.findById(favi._id)
                    .populate('user')
                    .populate('dishes')
                    .then((resp)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(resp);
                    },err=>next(err))
                    .catch((err)=>next(err))
                },err=>next(err))
                .catch((err)=>next(err))
            },err=>next(err))
            .catch((err)=>next(err))
        }
    },err=>next(err))
    .catch((err)=>next(err))
})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOneAndRemove({user:req.user._id})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },err=>next(err))
    .catch((err)=>next(err));
})

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})

.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        if(favorite){
            if(favorite.dishes.indexOf(req.params.dishId)===-1){
                favorite.dishes.push(req.params.dishId)
            }
            favorite.save()
            .then((fav)=>{
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then((resp)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(resp);
                },err=>next(err))
                .catch((err)=>next(err))
            },err=>next(err))
            .catch((err)=>next(err))
        }
        else{
            Favorites.create({user:req.user._id})
            .then((fav)=>{
                for (var i=req.body.length-1;i>=0;i--){
                    fav.dishes.push(req.body[i]._id)
                }
                fav.save()
                .then((fav)=>{
                    Favorites.findById(fav._id)
                    .populate('user')
                    .populate('dishes')
                    .then((resp)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(resp);
                    },err=>next(err))
                    .catch((err)=>next(err))
                },err=>next(err))
                .catch((err)=>next(err))
            },err=>next(err))
            .catch((err)=>next(err))
        }
        
    },err=>next(err))
    .catch((err)=>next(err))
})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favorite)=>{
        if (favorite){
            const index = favorite.dishes.indexOf(req.params.dishId)
            if (index>=0){
            favorite.dishes.splice(index,1)
            favorite.save()
            .then((fav)=>{
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then((resp)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(resp);
                },err=>next(err))
                .catch((err)=>next(err))       
            },err=>next(err))
            .catch((err)=>next(err))
            }
            else{
                var err = new Error("Dish not there");
                err.status=404;
                return next(err);
            }
        }
        else{
            var err = new Error("Dish not there");
            err.status=404;
            return next(err);
        }
        
    },err=>next(err))
    .catch((err)=>next(err))

})

module.exports = favouriteRouter;