const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Remark = require("../models/Remark");

router.get("/new", (req, res) => {
  res.render("eventForm.ejs");
});

router.post("/", (req, res, next) => {
  req.body.categories = req.body.categories.split(",");
  Event.create(req.body, (err, createdEvent) => {
    if (err) return next(err);
    res.redirect("/events");
  });
});

router.get("/", (req, res, next) => {
  if (req.query.category) {
    Event.find({ categories: req.query.category }, (err, events) => {
      if (err) return next(err);
      res.render("eventsList", { events });
    });
  } else if (req.query.location) {
    Event.find({ location: req.query.location }, (err, events) => {
      if (err) return next(err);
      res.render("eventsList", { events });
    });
  } else if (req.query.date) {
    Event.find({})
      .sort({ start_date: req.query.date })
      .exec((err, events) => {
        if (err) return next(err);
        res.render("eventsList", { events });
      });
  } else {
    Event.find({}, (err, events) => {
      if (err) return next(err);
      res.render("eventsList", { events });
    });
  }
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Event.findById(id)
    .populate("remarks")
    .exec((err, event) => {
      if (err) return next(err);
      res.render("eventDetail", { event });
    });
});

router.get("/:id/edit", (req, res, next) => {
  const id = req.params.id;
  Event.findById(id, (err, event) => {
    if (err) return next(err);
    res.render("updateEventForm", { event });
  });
});

router.post("/:id", (req, res, next) => {
  const id = req.params.id;
  req.body.categories = req.body.categories.split(",");
  Event.findByIdAndUpdate(id, req.body, (err, updatedEvent) => {
    if (err) return next(err);
    res.redirect("/events/" + id);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const id = req.params.id;
  Event.findByIdAndDelete(id, (err, deletedEvent) => {
    if (err) return next(err);
    Remark.deleteMany({ eventId: id }, (err, info) => {
      if (err) return next(err);
      res.redirect("/events");
    });
  });
});

router.post("/:id/remarks", (req, res, next) => {
  const id = req.params.id;
  req.body.eventId = id;
  Remark.create(req.body, (err, createdRemark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      id,
      { $push: { remarks: createdRemark.id } },
      (err, updatedEvent) => {
        if (err) return next(err);
        res.redirect("/events/" + id);
      }
    );
  });
});

router.get("/:id/likes", (req, res, next) => {
  const id = req.params.id;
  Event.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, updatedEvent) => {
    if (err) return next(err);
    res.redirect("/events/" + id);
  });
});

module.exports = router;
