const express = require("express");
const Remark = require("../models/Remark");
const Event = require("../models/Event");
const router = express.Router();

router.get("/:id/edit", (req, res, next) => {
  const id = req.params.id;
  Remark.findById(id, (err, remark) => {
    if (err) return next(err);
    res.render("updateRemark", { remark });
  });
});

router.post("/:id", (req, res, next) => {
  const id = req.params.id;
  Remark.findByIdAndUpdate(id, req.body, (err, updatedRemark) => {
    if (err) return next(err);
    res.redirect("/events/" + updatedRemark.eventId);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const id = req.params.id;
  Remark.findByIdAndDelete(id, (err, deletedRemark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      deletedRemark.eventId,
      { $pull: { remarks: deletedRemark.id } },
      (err, updatedEvent) => {
        if (err) return next(err);
        res.redirect("/events/" + updatedEvent.id);
      }
    );
  });
});

router.get("/:id/likes", (req, res, next) => {
  const id = req.params.id;
  Remark.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, updatedRemark) => {
    if (err) return next(err);
    res.redirect("/events/" + updatedRemark.eventId);
  });
});

module.exports = router;
