var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var resizeImg = require('resize-img');
var fs = require('fs-extra');
multer = require('multer');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var Product = require('../models/product');
var Category = require('../models/category');

router.get('/',isAdmin, (req, res) => {
    var count;
    Product.count((err, c) => {
        count = c;
    });
    Product.find((err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        })
    })
});

router.get('/add-product',isAdmin, function (req, res) {

    var title = "";
    var desc = "";
    var price = "";

    Category.find(function (err, categories) {
        res.render('admin/add-products', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});


router.post('/add-product', (req, res) => {
    if (!req.files) { imageFile = ""; }
    if (req.files) {
        var imageFile = typeof (req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price
    var category = req.body.category;
    var errors = req.validationErrors();
    if (errors) {

        Category.find(function (err, categories) {
            res.render('admin/add-products', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({ slug: slug }, (err, product) => {
            if (product) {
                req.flash('danger', 'Product slug exists, choose another.')
                Category.find(function (err, categories) {
                    res.render('admin/add-products', {
                        errors: errors,
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });

            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                })

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        })
    }
});

router.get('/edit-product/:id',isAdmin, (req, res) => {
    var errors;
    if (req.session.errors) {
        errors = req.session.errors
    }
    errors = null;
    Category.find(function (err, categories) {
        Product.findById(req.params.id, (err, p) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/products')
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files
                        res.render('admin/edit-product', {
                            errors: errors,
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id

                        });
                    }


                });
            }
        });

    });



});

router.post('/edit-product/:id', (req, res) => {
    if (!req.files) { imageFile = ""; }
    if (req.files) {
        var imageFile = typeof (req.files.image) !== "undefined" ? req.files.image.name : "";
    }
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price
    var category = req.body.category;
    var id = req.params.id;
    var pimage = req.body.pimage;
    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id)
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, (err, p) => {
            if (err)
                console.log(err)
            if (p) {
                req.flash('danger', 'Product title exist choose another .')
                res.redirect('/admin/products/edit-product/' + id)
            } else {
                Product.findById(id, (err, p) => {
                    if (err)
                        console.log(err)
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    p.save((err) => {
                        if (err)
                            console.log(err)
                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, (err) => {
                                    if (err)
                                        console.log(err)
                                })
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });
                        }
                        req.flash('success', 'Product edited !');
                        res.redirect('/admin/products')
                    })
                })
            }

        })
    }

})
// post product gallery 
router.post('/product-gallery/:id', (req, res) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
    productImage.mv(path, (err) => {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then((buf) => {
            fs.writeFileSync(thumbPath, buf);
        })
    });
    res.sendStatus(200);
});

router.get('/delete-image/:image',isAdmin, (req, res) => {
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, (err) => {
        if (err) {
            console.log(err)
        } else {
                fs.remove(thumbImage,(err)=>{
                  if(err) {
                      console.log(err);
                  } else{
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                  }
                })
        }
    })
});

router.get('/delete-product/:id',isAdmin,(req,res)=>{
    var id = req.params.id;
    var path = 'public/product_images/' + id;
    fs.remove(path,(err)=>{
        if(err){
            console.log(err)
        }else{
            Product.findByIdAndRemove(id,(err)=>{
                if(err)
                console.log(err);
                req.flash('success', 'Product deleted!');
                res.redirect('/admin/products');
                
            })
        }
    })
})
module.exports = router