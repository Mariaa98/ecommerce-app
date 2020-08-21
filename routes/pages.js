var express = require('express');
var router =  express.Router();
var Page = require('../models/page');

router.get('/',function(req,res){
    Page.findOne({slug:'home'},(err,page)=>{
        if(err)
        console.log(err)

        res.render('index',{
            title:page.title,
            content:page.content
        })
    })
});
//Get a Page
router.get('/:slug',(req,res)=>{
    var slug = req.params.slug;

    Page.findOne({slug: slug}, function (err, page) {
        if (err)
            console.log(err);
        
        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });
});

//Exports
module.exports = router ;