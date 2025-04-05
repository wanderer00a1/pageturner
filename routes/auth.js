const express = require("express");
const router = express.Router();
const passport = require("passport");

//@desc Auth with Google
//Get /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

//Get /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

//LogoutUser
// /auth/logout

router.get("/logout", (req, res) => {
  req.logOut((err) =>{
    if(err){
      return next(err);
    }
  });
  res.redirect("/");
});

module.exports = router;
