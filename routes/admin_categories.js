var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

router.get('/',isAdmin, (req, res) => {
    Category.find((err, categories) => {
        if (err)
            console.log(err)
        res.render('admin/categories', {
            categories: categories
        })

    })
});
router.get('/add-category',isAdmin, (req, res) => {
    var title = "";
    res.render('admin/add-category', {
        title: title
    })
})

router.post('/add-category', (req, res) => {
    req.checkBody('title', 'title must have a value').notEmpty();
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    errors = req.validationErrors();
    if (errors) {
        res.render('admin/add-category', {
            title: title
        })
    } else {
        Category.findOne({ slug: slug }, (err, category) => {
            if (err) {
                req.flash('danger', 'Category slug exist , choose anothe .');
                res.render('admin/add-category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });
                category.save((err) => {
                    if (err)
                        return console.log(err)
                    Category.find({}, (err, categories) => {
                        if (err) { console.log(err) } else {
                            app.locals.categories = categories;
                        }

                    })
                    req.flash('sucess', 'Category added');
                    res.redirect('/admin/categories');
                })
            }


        })
    }

});
//get edit category
router.get('/edit-category/:id',isAdmin, (req, res) => {
    Category.findById(req.params.id, (err, category) => {
        if (err)
            return console.log(err)
        res.render('admin/edit-category', {
            title: category.title,
            id: category.id

        });
    });
});

//Post edit-Category
router.post('/edit-category/:id', (req, res) => {
    req.checkBody('title', 'title must have a value.').notEmpty();
    var title = req.body.title;
    var id = req.params.id;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit-category', {
            errors: errors,
            title: title,
            id: id
        })
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, (err, category) => {
            if (category) {
                req.flash('danger', 'Category title exist choose another .')
                res.redirect('admin/edit-category', {
                    title: title,
                    id: id
                })
            } else {
                Category.findById(id, (err, category) => {
                    if (err)
                        return console.log(err)
                    category.title = title;
                    category.slug = slug;
                    category.id = id
                    category.save((err) => {
                        if (err)
                            return console.log(err)
                        Category.find({}, (err, categories) => {
                            if (err) { console.log(err) } else {
                                app.locals.categories = categories;
                            }

                        })
                        req.flash('sucess', 'Category edited .')
                        res.redirect('/admin/categories/')
                    })
                })


            }
        })
    }
});
router.get('/delete-category/:id',isAdmin, (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err) => {
        if (err)
            console.log(err)
        Category.find({}, (err, categories) => {
            if (err) { console.log(err) } else {
                app.locals.categories = categories;
            }

        })
        req.flash('success', 'Category delted')
        res.redirect('/admin/categories/')
    })
})
module.exports = router;