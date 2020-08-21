var express = require('express');
var router = express.Router();
var Page = require('../models/page');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
/*
Get Pages index
*/
router.get('/',isAdmin, (req, res) => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/*
Get add page
*/
router.get('/add-page',isAdmin, (req, res) => {

    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content

    })

})

function relodd(req, res) {
    res.render('admin/add_page', {

        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content

    });
}
/*
POST add page
*/
router.post('/add-page', (req, res) => {
    req.checkBody('title', 'title must have a value ').notEmpty();
    req.checkBody('content', 'Content must have a value ').notEmpty();
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();
    if (errors) {
        relodd(req, res);
    } else {
        Page.findOne({ slug: slug }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');
                relodd(req, res);
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100

                });
                page.save((err) => {
                    if (err)
                        return console.log(err)
                    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
                        if (err) { console.log(err); } else {
                            req.app.locals.pages = pages
                        }

                    })
                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                })
            }

        })
    }



});
function sortPages(ids, callback) {
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        (function (count) {
            Page.findById(id, (err, page) => {
                page.sorting = count;
                page.save((err) => {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length)
                        callback();

                })
            })
        })(count)
    }
}

router.post('/reorder-pages', (req, res) => {
    var ids = req.body['id[]'];
    sortPages(ids, function () {
        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
            if (err) { console.log(err); } else {
                req.app.locals.pages = pages
            }

        })

    });


});
//GET edit page
router.get('/edit-page/:id',isAdmin, (req, res) => {
    Page.findById(req.params.id, (err, page) => {
        if (err)
            console.log(err)
        res.render('admin/edit-page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });

})

router.post('/edit-page/:id', (req, res) => {
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have value').notEmpty();
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug = "")
        var slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;
    var errors = req.validationErrors()
    if (errors) {
        res.render('admin/edit-page', {
            title: title,
            slug: slug,
            content: content,
            id: id
        })
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            }
            else {
                Page.findById(id, (err, page) => {
                    if (err)
                        console.log(err)
                    page.title = title,
                        page.slug = slug,
                        page.content = content

                    page.save((err) => {
                        if (err)
                            return console.log(err)
                        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
                            if (err) { console.log(err); } else {
                                req.app.locals.pages = pages
                            }

                        })

                        req.flash('success', 'Page-added')
                        res.redirect('/admin/pages/edit-page' + id)

                    })

                })

            }

        })
    }

});

router.get('/delete-page/:id',isAdmin, (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if (err)
            console.log(err)
        Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
            if (err) { console.log(err); } else {
                req.app.locals.pages = pages
            }

        })
        req.flash('sucess', 'Page-deleted')
        res.redirect('/admin/pages')
    })
})


module.exports = router;