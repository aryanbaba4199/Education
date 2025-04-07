const College = require("../model/college");
const Course = require("../model/course");
const Support = require("../model/support");
const Slide = require("../model/slide");
const User = require("../model/user");
const Category = require("../model/category");
const Tag = require("../model/tag");
const axios = require("axios");

require("dotenv").config();

async function calculateDistance(address1, address2) {
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
    const { mainCity, address } = req.body;
    const mainCityDistanceResult = await calculateDistance(mainCity, address);

    if (!mainCityDistanceResult.success) {
      return res.status(400).json({ error: mainCityDistanceResult.error });
    }

    const mainCityDistance = mainCityDistanceResult.distance;
    const formData = { ...req.body, mainCityDistance };

    const college = new College(formData);
    await college.save();

    console.log("College saved");
    res.status(201).json({ college });
  } catch (error) {
    next(error);
  }
};

exports.getCollege = async (req, res, next) => {
  try {
    const college = await College.find().sort({rank : 1});

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
    return res.status(200).json({ college, courses, supoorts });
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
    const { add1, add2 } = req.body; // ✅ Remove JSON.parse()
    console.log(add1, add2);

    if (!add1 || !add2) {
      console.log("no add1 or add2");
      return res
        .status(400)
        .json({ error: "Missing origin or destination address" });
    }

    // Reverse Geocode add2 (lat/lng) to get an address
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${add2.latitude},${add2.longitude}&key=${process.env.MAP_API}`;

    const geoResponse = await axios.get(geoUrl);

    if (!geoResponse.data.results.length) {
      return res
        .status(400)
        .json({ error: "Could not determine address from coordinates" });
    }

    const formattedAddress = geoResponse.data.results[0].formatted_address;
    console.log(`User Location Address: ${formattedAddress}`);

    // Call calculateDistance with readable address
    const distanceResult = await calculateDistance(add1, formattedAddress);
    console.log(
      `Distance to ${formattedAddress}: ${distanceResult.distance} meters`
    );
    if (!distanceResult.success) {
      return res.status(400).json({ error: distanceResult.error });
    }

    return res.status(200).json(distanceResult.distance); // Convert meters to km
  } catch (error) {
    next(error);
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
    const formData = {
      colleges,
      courses,
      users,
      supports,
      slides,
    };

    return res.status(200).json(formData);
  } catch (e) {
    console.error("Error in admin dashboard", e);
    next(e);
  }
};

exports.generateDescription = async (req, res, next) => {
  try {
    const { collegeName, university, address } = req.body;
    const prompt = `
You are an expert in education and content writing. Based on the following details, search the college on internet and write a detailed, structured, and positive 300-word description of the college. If the college is well-known, base the content on its reputation. If not, make up realistic but appealing details using common strengths of good colleges.

College Name: ${collegeName}
Address: ${address}
University Affiliation: ${university}

✦ Write the content in the following format:

1. **College Overview:** (Talk about its reputation, experience, and approval from authorities like UGC, AICTE, etc. if applicable.)
2. **Location & Accessibility:** (How students can reach the campus — metro, bus, or college transport. Mention nearby landmarks if relevant.)
3. **Affordability & Courses:** (Mention if it's affordable or offers value-for-money education. Mention variety of programs if known.)
4. **Campus Life & Facilities:** (Describe the campus, hostels, library, food, security, internet, extracurriculars.)
5. **Academic Excellence:** (Mention faculty, tie-ups with hospitals or industries, results, and focus on practical learning.)

Use an inspiring tone. Make it feel real, student-friendly, and trustworthy.

Keep it around 300 words. Do not include fee amounts or irrelevant data.
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
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