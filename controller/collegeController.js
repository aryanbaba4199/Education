const College = require("../model/college");
const Course = require("../model/course");
const Support = require("../model/support");
const Slide = require("../model/slide");
const User = require("../model/user");
const Category = require("../model/category");
const Tag = require("../model/tag");
const FeeTag = require('../model/FeesTags')
const Prompt = require('../model/prompts')
const axios = require("axios");

require("dotenv").config();

async function calculateDistance(address1, address2) {
  console.log(address1, address2)
  if (!address1 || !address2) {
    return { success: false, error: "Missing origin or destination address" };
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: address1,
          destinations: address2,
          key: process.env.MAP_API,
          units: "metric",
        },
      }
    );

    const data = response.data;
    console.log(data)
    
    if (data.rows.length && data.rows[0].elements.length) {
      const element = data.rows[0].elements[0];
      if (element.status === "OK") {
        const distanceValue = element.distance.value; // Distance in meters

        return { success: true, distance: distanceValue };
      }
      return {
        success: false,
        error: `Distance Matrix API error: ${element.status}`,
      };
    }
    return { success: false, error: "No results found" };
  } catch (error) {
    return { success: false, error: `An error occurred: ${error.message}` };
  }
}

exports.createCollege = async (req, res, next) => {
  try {
    const { mainCity, address, rank } = req.body;
    console.log(mainCity, address)

    // Step 1: Calculate distance
    const mainCityDistanceResult = await calculateDistance(mainCity, address);

    if (!mainCityDistanceResult.success) {
      return res.status(400).json({ error: mainCityDistanceResult.error });
    }

    const mainCityDistance = mainCityDistanceResult.distance;

    // Step 2: Shift other colleges' rank if conflict exists
    if (typeof rank === "number") {
      await College.updateMany(
        { rank: { $gte: rank } },
        { $inc: { rank: 1 } }
      );
    }

    // Step 3: Create new college
    const formData = { ...req.body, mainCityDistance };
    const college = new College(formData);
    await college.save();

    console.log("College saved with unique rank");
    res.status(201).json({ college });

  } catch (error) {
    next(error);
  }
};


exports.getCollege = async (req, res, next) => {
  try {
    const college = await College.find()
    .select('name university address mainCityDistance images selectedTags location category courseIds fees supportIds')
    .sort({rank : 1});

    return res.status(200).json(college);
  } catch (error) {
    next(error);
  }
};


exports.getacollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });
    const courses = await Course.find({ _id: { $in: college.courseIds } });
    const supoorts = await Support.find({ _id: { $in: college.supportIds } });
    const tags = await Tag.find({_id : {$in : college.selectedTags}})
    const category = (await Category.findById(college.category)).title
    return res.status(200).json({ college, courses, supoorts, tags, category });
  } catch (e) {
    console.error("Error in getting college", e);
    next(e);
  }
};

exports.updateCollege = async(req, res, next) => {
  try{
    const updatedCollege = await College.findByIdAndUpdate(req.params.collegeId, req.body, { new: true });
    if (!updatedCollege) return res.status(404).json({ message: "College not found" });
    return res.status(200).json(updatedCollege);
  }catch(e){
    console.error("Error in updating college", e);
    next(e);
  }
}

exports.removeCollge = async (req, res, next) => {
  try {
    const college = await College.findByIdAndDelete(req.params.collegId);
    if (!college) return res.status(404).json({ message: "College not found" });
    return res.status(200).json({ message: "College deleted successfully" });
  } catch (e) {
    console.error("Error in deleting college", e);
    next(e);
  }
};

exports.removeCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (e) {
    console.error("Error in deleting course", e);
    next(e);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    return res.status(200).json({ message: "Course created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    const courses = await Course.find();
    return res.status(200).json(courses);
  } catch (e) {
    console.error("Error in getting course", e);
    next(e);
  }
};

exports.createSupport = async (req, res, next) => {
  try {
    const support = new Support(req.body);
    await support.save();
    return res.status(200).json({ message: "Support created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getSupport = async (req, res, next) => {
  try {
    const supports = await Support.find();
    return res.status(200).json(supports);
  } catch (e) {
    next(e);
  }
};

exports.getDistancefromHome = async (req, res, next) => {
  try {
    const { add1, add2, manualAddress } = req.body;

    let sourceLocation = "";

    if (manualAddress) {
      sourceLocation = manualAddress;
    } else if (typeof add2 === "object" && add2.latitude && add2.longitude) {
      sourceLocation = `a location near latitude ${add2.latitude}, longitude ${add2.longitude} in Bihar, India`;
    } else if (typeof add2 === "string") {
      sourceLocation = add2;
    } else {
      return res.status(400).json({ message: "No valid source location provided." });
    }

    // Get dynamic prompt from DB
    const promptDoc = await Prompt.findOne({ title: 'distance' });
    if (!promptDoc || !promptDoc.prompt) {
      return res.status(500).json({ message: "Prompt not found in DB." });
    }

    // Replace variables in prompt string
    const formattedPrompt = promptDoc.prompt
      .replace(/\$\{sourceLocation\}/g, sourceLocation)
      .replace(/\$\{add1\}/g, add1);

    // Send to OpenAI
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GPT_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = gptRes.data.choices[0].message.content;
    return res.status(200).json(reply);
  } catch (err) {
    console.error("Error in getDistancefromHome", err);
    next(err);
  }
};



exports.suggestLocation = async (req, res, next) => {
  const { input, type = "geocode" } = req.query; // 'geocode' for address, '(cities)' for mainCity
  if (!input) return res.status(400).json({ error: "Input is required" });

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        params: {
          input,
          types: type,
          key: process.env.MAP_API,
        },
      }
    );
    res.json(response.data);
  } catch (e) {
    console.error("Error in suggesting location", e);
    next(e);
  }
};

exports.createSlide = async (req, res, next) => {
  try {
    console.log(req.body);
    const slide = new Slide(req.body);
    await slide.save();
    return res.status(200).json({ message: "Slide created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getSlide = async (req, res, next) => {
  try {
    const slides = await Slide.find();
    return res.status(200).json(slides);
  } catch (e) {
    console.error("Error in getting slide", e);
    next(e);
  }
};

exports.adminDashboard = async (req, res, next) => {
  try {
    const colleges = await College.countDocuments();
    const courses = await Course.countDocuments();
    const supports = await Support.countDocuments();
    const slides = await Slide.countDocuments();
    const users = await User.countDocuments();
    const prompts = await Prompt.countDocuments();
    const formData = {
      colleges,
      courses,
      users,
      supports,
      slides,
      prompts,
    };

    return res.status(200).json(formData);
  } catch (e) {
    console.error("Error in admin dashboard", e);
    next(e);
  }
};



// CREATE
exports.createPrompt = async (req, res, next) => {
  try {
    const { title, prompt } = req.body;
    const newPrompt = new Prompt({ title, prompt });
    await newPrompt.save();
    return res.status(201).json({ success: true, data: newPrompt });
  } catch (e) {
    console.error('Error in creating prompt:', e);
    next(e);
  }
};

// READ / GET ALL
exports.getPrompts = async (req, res, next) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: prompts });
  } catch (e) {
    console.error('Error in getting prompts:', e);
    next(e);
  }
};

// UPDATE
exports.updatePrompt = async (req, res, next) => {
  try {
    const { id, title, prompt } = req.body;
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { title, prompt },
      { new: true }
    );
    if (!updatedPrompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }
    return res.status(200).json({ success: true, data: updatedPrompt });
  } catch (e) {
    console.error('Error in updating prompt:', e);
    next(e);
  }
};

// DELETE
exports.deletePrompt = async (req, res, next) => {
  try {
    const { id } = req.body;
    const deleted = await Prompt.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }
    return res.status(200).json({ success: true, message: 'Prompt deleted successfully' });
  } catch (e) {
    console.error('Error in deleting prompt:', e);
    next(e);
  }
};


exports.generateDescription = async (req, res, next) => {
  try {
    const { collegeName, university, address } = req.body;

    // Get prompt from DB
    const promptDoc = await Prompt.findOne({ title: 'discription' });

    if (!promptDoc || !promptDoc.prompt) {
      return res.status(500).json({ message: "Prompt not found in DB." });
    }

    // Replace variables inside the prompt
    const formattedPrompt = promptDoc.prompt
      .replace(/\$\{collegeName\}/g, collegeName)
      .replace(/\$\{university\}/g, university)
      .replace(/\$\{address\}/g, address);

    // Call OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GPT_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const description = response.data.choices[0].message.content;
    return res.status(200).json(description);
  } catch (e) {
    console.error("Error in generating description", e);
    next(e);
  }
};





exports.correctPath = async (req, res, next) => {
  console.log('called');
  try {
    const { collegeName, university, address, reach } = req.body;

    // Fetch the prompt from DB
    const promptDoc = await Prompt.findOne({ title: 'path' });

    if (!promptDoc || !promptDoc.prompt) {
      return res.status(500).json({ message: "Prompt not found in DB." });
    }

    // Format user reach input
    const userNote = reach?.replace("Regenerate:", "").trim();
    const regenerationNote = reach?.startsWith("Regenerate:")
      ? `🛠️ Note: The user requested a regeneration of the previous suggestions. Improve clarity and accuracy using all provided data.\n\n`
      : "";

    // Inject values into the prompt
    const formattedPrompt = promptDoc.prompt
      .replace(/\$\{collegeName\}/g, collegeName)
      .replace(/\$\{university\}/g, university)
      .replace(/\$\{address\}/g, address)
      .replace(/\$\{reach\.startsWith\("Regenerate:"\) \? `.*?` : ""\}/g, regenerationNote)
      .replace(/\$\{reach\.replace\("Regenerate:", ""\)\.trim\(\)\}/g, userNote);

    // Call OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: formattedPrompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GPT_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const guide = response.data.choices[0].message.content;
    return res.status(200).json(guide);
  } catch (e) {
    console.error("Error in correctPath:", e);
    next(e);
  }
};





//---------------------------Category ----------------------------------

exports.createCategory = async (req, res, next) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    return res.status(200).json({ message: "Category created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (e) {
    console.error("Error in getting category", e);
    next(e);
  }
}

exports.updateCategory = async (req, res, next) => {
  try {
    const id = req.params.catId;
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
}

exports.createTag = async(req, res, next) => {
  try {
    const newTag = new Tag(req.body);
    await newTag.save();
    return res.status(200).json({ message: "Tag created successfully" });
  } catch (error) {
    next(error);
  }
}

exports.getTag = async (req, res, next) => {
  try {
    const tags = await Tag.find();
    return res.status(200).json(tags);
  } catch (e) {
    console.error("Error in getting tag", e);
    next(e);
  }
}

exports.updateTag = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedTag = await Tag.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    return res.status(200).json(updatedTag);
  } catch (error) {
    next(error);
  }
}

exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTag = await Tag.findByIdAndDelete(id);

    if (!deletedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    next(error);
  }
}


exports.createFeesTag = async(req, res, next)=>{
  try{
    const newTag = new FeeTag(req.body);
    await newTag.save()
    return res.status(200).json(newTag)
  }catch(e){
    console.error('Error in creating tags ')
  }
}

exports.getFeeTags = async(req, res, next)=>{
  try{
    const tags = await FeeTag.find()
    return res.status(200).json(tags)
  }catch(e){
    console.error('Error in creating tags ')
  }
}

exports.removeFeeTag = async(req, res, next)=>{
  try{
    await FeeTag.findByIdAndDelete(req.params.id)
    return res.status(200).json({message : 'Deleted'})
  }catch(e){
    console.error('Error in removing', e)
  }
}