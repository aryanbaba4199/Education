const express = require('express');

const {createCollege, createCourse,
    getCollege, getCourse, createSupport, getSupport, getacollege, getDistancefromHome,
    getSlide, createSlide,
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

module.exports = router;