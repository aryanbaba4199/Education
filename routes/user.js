const express = require('express');
const {createUser, getUser, getAdmin, allUser} = require('../controller/user');


const router = express.Router();


router.get('/getUser', getUser);
router.post('/createUser', createUser);
router.post('/adminLogin', getAdmin);
router.get('/admin/users/:page', allUser);

module.exports = router;




