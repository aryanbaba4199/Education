const User = require("../model/user");
const jwt = require("jsonwebtoken");

const generateToken = async(id) => {
  try {
    const token = await jwt.sign({ id: id }, "hfgsj", { expiresIn: "365d" });
    return token;
  } catch (e) {
    console.error("Error generating token", e);
    return null;
  }
};

exports.createUser = async (req, res, next) => {
  console.log("createUser", req.body);
  try {
    const exisingUser = await User.findOne({ mobile: req.body.mobile });

    if (exisingUser) {
      const token = await generateToken(exisingUser._id);

      return res.status(201).json(token);
    }
    const user = new User(req.body);
    await user.save();
    const token = await generateToken();
    return res.status(200).json(token);
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, email, mobile, _id } = user;
    res.json({ name, mobile, email, _id });
  } catch (error) {
    next(error);
  }
};

exports.allUser = async (req, res, next) => {
  const page = parseInt(req.params.page) || 1; // Ensure page is a number
  const skip = (page - 1) * 50;

  try {
    const users = await User.find().skip(skip).limit(50);
    const totalUser = await User.countDocuments();

    return res.status(200).json({
      success: true,
      users,
      totalUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({
      adminId: req.body.id,
      password: req.body.password,
    });
    if (user) {
      const token = await generateToken(user._id);
      return res.status(200).json(token);
    } else {
      return res.status(401).json({ error: "Invalid ID or password" });
    }
  } catch (e) {
    next(e);
  }
};
