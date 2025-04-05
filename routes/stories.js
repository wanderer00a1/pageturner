const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/story");

//Login  ->     create story
router.get("/add", ensureAuth, (req, res) => {
  res.render("Stories/stories");
});

//Process Add Form
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (e) {
    console.log("error", e);
    res.render("error/500");
  }
});

//stories  /Display all stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index", { stories });
  } catch (e) {
    console.log("error", err);
    res.render("error/500");
  }
});

//show Story
router.get("/:id", ensureAuth, async (req, res) => {
  try{
    let story = await Story.findById(req.params.id)
      .populate('user')
      .lean();
    if(!story){
      return res.render('error/404');
    }
    res.render('stories/show',{
      story
    })
  }catch(e){
    console.log(e);
    res.render('error/404');
  }
});


//Edit Page
//stories/edit/7810
router.get("/edit/:id", ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean();
  if (!story) {
    return res.render("error/404");
  }
  if (story.user.toString() !== req.user.id) {
    res.redirect("/stories");
  } else {
    res.render("Stories/edit", { story });
  }
});

//Update Story
router.put("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();
  if (!story) {
    return res.render("error/404");
  }
  if (story.user.toString() !== req.user.id) {
    res.redirect("/stories");
  } else {
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/dashboard");
  }
});

//Delete Story   /delete

router.delete('/:id',ensureAuth,async(req,res) =>{
  try {
    await Story.deleteOne({_id:req.params.id});
    res.redirect('/dashboard');
  } catch (e) {
    console.error(e);
    return res.render('error/500');
  }
});

//user stories
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user:req.params.userId,
      status:'public'
    })
    .populate('user')
    .lean()
  res.render('stories/index',{stories})
  } catch (e) {
    console.error(e);
    res.render('error/500');
  }
});

module.exports = router;
