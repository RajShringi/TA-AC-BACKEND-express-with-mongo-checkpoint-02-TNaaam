const express = require("express");
const app = require("../app");
const { events } = require("../models/Event");
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

router.use("/", (req, res, next) => {
  Event.distinct("categories", {}).exec((err, categories) => {
    res.locals.categoriesArr = categories;
    Event.distinct("location", {}).exec((err, locations) => {
      res.locals.locationsArr = locations;
      next();
    });
  });
});

router.get("/", (req, res, next) => {
  let searchQuery;
  let date;
  if (req.query.categories) {
    searchQuery = req.query;
  } else if (req.query.location) {
    searchQuery = req.query;
  } else if (req.query.date) {
    searchQuery = {};
    date = req.query.date;
  } else {
    searchQuery = {};
  }

  Event.find(searchQuery)
    .sort({ start_date: date })
    .exec((err, events) => {
      if (err) return next(err);
      console.log(res.locals.locationsArr, res.locals.categoriesArr, date);
      res.render("eventsList", {
        events,
        locationsArr: res.locals.locationsArr,
        categoriesArr: res.locals.categoriesArr,
      });
    });
});

router.post("/inbetween", (req, res, next) => {
  Event.find(
    {
      $and: [
        { start_date: { $gte: req.body.startDate } },
        { end_date: { $lte: req.body.endDate } },
      ],
    },
    (err, events) => {
      if (err) return next(err);
      res.render("eventsList", {
        events,
        locationsArr: res.locals.locationsArr,
        categoriesArr: res.locals.categoriesArr,
      });
    }
  );
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
