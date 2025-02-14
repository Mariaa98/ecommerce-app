var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Page = require('../models/page');
var Category = require('../models/category');
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

router.get('/', function (req, res) {
    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products
        });
    });

});
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug }, function (err, c) {
        Product.find({ category: categorySlug }, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });

});

router.get('/:category/:product', (req, res) => {
    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Product.findOne({ slug: req.params.product }, (err, product) => {
        if (err) { console.log(err) } else {
            var galleryDir = 'public/product_images/' + product.id + '/gallery';
            fs.readdir(galleryDir, (err, files) => {
                if (err) {
                    console.log(err)
                } else {
                    galleryImages = files;
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }

    });
});

module.exports = router
