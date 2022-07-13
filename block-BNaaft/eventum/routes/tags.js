// const express = require("express");
// const Category = require("../models/Category");
// const router = express.Router();

// router.get("/:id", (req, res, next) => {
//   const id = req.params.id;
//   Category.findById(id)
//     .populate("events")
//     .exec((err, Category) => {
//       if (err) return next(err);
//       Category.find({}, (err, Categorys) => {
//         if (err) return next(err);
//         console.log(Category, Categorys);
//         res.render("eventsList", { events: Category.events, Categorys });
//       });
//     });
// });

// module.exports = router;
