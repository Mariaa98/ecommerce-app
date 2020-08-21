var express =  require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

var User = require('../models/user');

router.get('/register',(req,res)=>{
    res.render('register',{
        title:'Register'
    });
});

router.post('/register',(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    req.checkBody('name','Name is required !').notEmpty();
    req.checkBody('email','Email is required!').isEmail();
    req.checkBody('username','UserName is required !').notEmpty();
    req.checkBody('password','Password is required !').notEmpty();
    req.checkBody('password2','password do not match !').equals(password);

    var errors = req.validationErrors();
    if(errors){
        res.render('register',{
            errors:errors,
            user: null,
            title:'Register'
        });
    }else{
        var user = new User({
            name:name,
            email:email,
            userName:username,
            password:password,
            admin: 0
            
        });
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err)
                console.log(err)
                user.password = hash
                user.save((err)=>{
                    if(err)
                    console.log(err)
                    req.flash('success','You are now registered !');
                    res.redirect('/users/login')
                });
            });
        });
    }

});

router.get('/login',(req,res)=>{
    if(res.locals.user) res.redirect('/');
    res.render('login',{
        title:'Log In'
    });
});

router.post('/login', function (req, res, next) {

    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req, res, next);
 
});

router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});
module.exports = router;