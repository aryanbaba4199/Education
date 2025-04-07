

const AppDetails = require('../model/appdetails');


exports.createAppDetails = async (req, res, next) => {
    try {
        const appDetails = new AppDetails(req.body);
        await appDetails.save();
        res.status(201).json(appDetails);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getAppDetails = async (req, res, next) => {
    try {
        const appDetails = await AppDetails.findOne();
        res.status(200).json(appDetails);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateDetails = async (req, res, next) => {
    try {
        const updatedAppDetails = await AppDetails.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedAppDetails);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};