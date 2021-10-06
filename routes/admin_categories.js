var express = require('express')
var router = express.Router()
var auth = require('../config/auth')
var isAdmin = auth.isAdmin

const Category = require('../models/category')

router.get('/', isAdmin, (req,res)=> {
    
    Category.find(function(err,categories) {
            if (err) return console.log(err)
            res.render('admin/categories', {
                categories: categories
            })
        })
    })


router.get('/add-category', isAdmin, (req,res)=> {
    
    var title = "";
    
    res.render('admin/add_category', {
        title: title        
    }) 
})

router.post('/add-category', (req,res)=> {
    
    req.checkBody('title', 'Title must have a value').notEmpty();   

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();    

    var errors = req.validationErrors()

    if (errors) {
        console.log('errors')
        res.render('admin/add_category', {
        errors: errors,
        title: title
    })  
    } else {
        Category.findOne({ slug: slug}, function(err,category){
            if (category) {
                req.flash('danger', 'Category title exists, choose another')
                res.render('admin/add_category', {                    
                     title: title                     
                })
            } else {
                var category = new Category({
                     title: title,
                     slug: slug
                })

                category.save(function(err){
                    if (err) 
                    return console.log(err)

                    req.flash('success', 'Category added')
                    res.redirect('/admin/categories')
                })
            }
        })
    }

})

// POST reorder pages

router.post('/reorder-pages', (req,res)=> {
    var ids = req.body['id[]'];

    var count = 0;

    for (var i = 0; i < ids.lenght; i++) {
        var id = ids[i];
        count++;

        (function(count) {
        Page.findById(id, function (err, page){
            page.sorting = count;
            page.save(function (err) {
                if (err)
                    return console.log(err)
            })
        })
     })(count);
    }
})


// GET edit category

router.get('/edit-category/:id', isAdmin,  (req,res)=> {
    
    Category.findById(req.params.id, function(err,category) {
        if (err)
            return console.log(err)

            res.render('admin/edit_category', {
        title: category.title,        
        id: category._id
      }) 
    })    
    
})

// POST edit page
router.post('/edit-category/:id', (req,res)=> {
    
    req.checkBody('title', 'Title must have a value').notEmpty();    

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();    
    var id = req.params.id;

    var errors = req.validationErrors()

    if (errors) {
        console.log('errors')
        res.render('admin/edit_category', {
        errors: errors,
        title: title,
        id: id
    })  
    } else {
        Category.findOne({ slug: slug, _id:{'$ne':id}}, function(err,category){
            if (category) {
                req.flash('danger', 'Page slug exists, choose another')
                res.render('admin/edit_category', {                    
                     title: title,                                         
                     id: id
                })
            } else {
                 Category.findById(id, function(err,category) {
                    if (err) return console.log(err)
                    
                    category.title = title;
                    category.slug = slug;                                    

                category.save(function(err){
                    if (err) 
                    return console.log(err)

                    req.flash('success', 'Category edited')
                    res.redirect('/admin/categories/edit-category/'+ id)
                })
              })
            }        
        })
    }

})

router.get('/delete-category/:id', isAdmin, (req,res)=> {
    Category.findByIdAndRemove(req.params.id, (err)=> {
        if (err) return console.log(err);

        req.flash('success', 'Category deleted');
        res.redirect('/admin/categories/')
    })
})
module.exports = router