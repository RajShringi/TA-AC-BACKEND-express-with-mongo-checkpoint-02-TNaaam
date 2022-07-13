const express = require("express");
const { events } = require("../models/Event");
const router = express.Router();
const Event = require("../models/Event");
const Remark = require("../models/Remark");
const Tag = require("../models/Tag");

router.get("/new", (req, res, next) => {
  res.render("eventForm");
});

// router.post("/", (req, res, next) => {
//   req.body.categories = req.body.categories.split(",");
//   Event.create(req.body, (err, createdEvent) => {
//     if (err) return next(err);
//     res.redirect("/events");
//   });
// });

router.get("/latest", (req, res, next) => {
  Event.find({})
    .sort({ start_date: -1 })
    .exec((err, events) => {
      if (err) return next(err);
      Tag.find({}, (err, tags) => {
        if (err) return next(err);
        res.render("eventsList", { events, tags });
      });
    });
});

router.get("/oldest", (req, res, next) => {
  Event.find({})
    .sort({ start_date: 1 })
    .exec((err, events) => {
      if (err) return next(err);
      Tag.find({}, (err, tags) => {
        if (err) return next(err);
        res.render("eventsList", { events, tags });
      });
    });
});

router.post("/", (req, res, next) => {
  req.body.categories = req.body.categories.split(",");
  Event.create(req.body, (err, createdEvent) => {
    if (err) return next(err);
    req.body.categories.forEach((category) => {
      Tag.findOneAndUpdate(
        { name: category },
        { $set: { name: category }, $push: { events: createdEvent.id } },
        { upsert: true },
        (err, updatedCategory) => {
          if (err) return next(err);
          console.log("updated");
        }
      );
    });
    res.redirect("/events");
  });
});

router.get("/", (req, res, next) => {
  Event.find({}, (err, events) => {
    if (err) return next(err);
    Tag.find({}, (err, tags) => {
      if (err) return next(err);
      res.render("eventsList", { events, tags });
    });
  });
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
  const event_id = req.params.id;
  Event.findById(event_id, (err, event) => {
    if (err) return next(err);
    res.render("updateEventForm", { event });
  });
});

router.post("/:id", (req, res, next) => {
  const event_id = req.params.id;
  req.body.categories = req.body.categories.split(",");
  Event.findByIdAndUpdate(event_id, req.body, (err, updatedEvent) => {
    if (err) return next(err);
    res.redirect("/events/" + event_id);
  });
});

router.get("/:id/delete", (req, res, next) => {
  const event_id = req.params.id;
  Event.findByIdAndDelete(event_id, (err, deletedEvent) => {
    if (err) return next(err);
    deletedEvent.categories.forEach((category) => {
      Tag.findOneAndUpdate(
        { name: category },
        { $pull: { events: deletedEvent.id } },
        (err, updatedTag) => {
          if (err) return next(err);
          console.log("event no longer belong to this event");
        }
      );
    });
    Remark.deleteMany({ eventId: event_id }, (err, info) => {
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
        console.log(updatedEvent);
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

router.get("/:loc_name/location", (req, res, next) => {
  let location = req.params.loc_name;
  Event.find({ location: location }, (err, events) => {
    if (err) return next(err);
    Tag.find({}, (err, tags) => {
      if (err) return next(err);
      res.render("eventsList", { events, tags });
    });
  });
});

module.exports = router;
