
const User = require('../model/user');
const jwt = require('jsonwebtoken');


const generateToken = async(id)=>{
    try{
        const token = await jwt.sign({id : id}, 'hfgsj', {expiresIn : '365d'} )
        return token;
    }catch(e){
        console.error('Error generating token', e);
        return null;
    }
}

exports.createUser = async(req, res, next) => {
    console.log('createUser');
    try {
        const exisingUser = await User.findOne({mobile : req.body.mobile});
        
        if(exisingUser){
            const token = await generateToken()
            console.log('token generated', token);
            return res.status(201).json(token);
        }
        const user = new User(req.body);
        await user.save();
        const token = await generateToken()
         return res.status(200).json(token);
    } catch (error) {
        next(error);
    }
};

exports.getUser = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const {name, email, mobile, _id} = user;
        res.json({name, mobile, email, _id});
    } catch (error) {
        next(error);
    }
};