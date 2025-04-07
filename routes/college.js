const express = require('express');

const {createCollege, createCourse,
    getCollege, getCourse, createSupport, getSupport, getacollege, getDistancefromHome,
    getSlide, createSlide, adminDashboard, suggestLocation, removeCollge, removeCourse,
     generateDescription, createCategory, getCategory, updateCategory, deleteCategory,
     createTag, getTag, deleteTag, updateTag, 

}  = require('../controller/collegeController');
const router = express.Router();
router.post('/ccollege', createCollege);
router.post('/ccourse', createCourse);
router.get('/gcollege', getCollege)
router.get('/gcourse', getCourse)
router.post('/csupport', createSupport)
router.get('/gsupport', getSupport)
router.get('/gcollegebyid/:id', getacollege)
router.post('/distance', getDistancefromHome)
router.post('/cslide', createSlide)
router.get('/gslide', getSlide)
router.get('/dashboard', adminDashboard)
router.get('/suggestLocation', suggestLocation)
router.delete('/dcollege/:collegId', removeCollge)
router.delete('/dcourse/:courseId', removeCourse)
router.post('/helper/generateDescription', generateDescription)


router.post('/ccategory', createCategory)
router.get('/gcategory', getCategory)
router.delete('/dcategory/:id', deleteCategory)
router.put('/ucategory/:catId', updateCategory)
router.post('/ctag', createTag)
router.get('/gtag', getTag)
router.delete('/dtag/:id', deleteTag)
router.put('/utag/:id', updateTag)
module.exports = router;