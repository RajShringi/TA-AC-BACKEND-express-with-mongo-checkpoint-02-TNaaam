const express = require("express");
const Tag = require("../models/Tag");
const router = express.Router();

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Tag.findById(id)
    .populate("events")
    .exec((err, tag) => {
      if (err) return next(err);
      Tag.find({}, (err, tags) => {
        if (err) return next(err);
        console.log(tag, tags);
        res.render("eventsList", { events: tag.events, tags });
      });
    });
});

module.exports = router;
