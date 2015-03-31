'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  _ = require('lodash');

exports['db.strainCategories.update'] = function (app, msg, cb) {
  app.models.strainCategories.findById(msg.body._id, 'title bgColor textColor arcBgColor', function (err,
                                                                                                     strainCategory) {
    if (err) { return cb(err); }
    app.models.strains.update(
      {'category._id': msg.body._id},
      {
        '$set': {
          'category.title': strainCategory.title,
          'category.bgColor': strainCategory.bgColor,
          'category.textColor': strainCategory.textColor,
          'category.arcBgColor': strainCategory.arcBgColor
        }
      },
      {multi: true},
      function (err, count) {
        app.log.info('Strains category reference updated - ' + count + '.');
        if (err) { return cb(err); }
        cb();
      });
  });
};

exports['db.strains.insert'] = exports['db.strains.update'] = function (app, msg, cb) {
  app.models.strains.findById(msg.body._id, 'category', function (err, strain) {
    if (err) { return cb(err); }
    app.models.strainCategories.findById(strain.category._id, function (err, category) {
      if (err) { return cb(err); }
      strain.category.title = category.title;
      strain.category.textColor = category.textColor;
      strain.category.bgColor = category.bgColor;
      strain.category.arcBgColor = category.arcBgColor;
      strain.category.alias = category.alias;
      strain.save(function (err) {
        if (err) { return cb(err); }
        app.services.mq.push(app, 'events', {name: 'stat.strainCategories.updateStrainCount'}, cb);
      });
    });
  });
};

exports['db.strains.delete'] = function (app, msg, cb) {
  app.services.mq.push(app, 'events', {name: 'stat.strainCategories.updateStrainCount'}, cb);
};

exports['stat.strainCategories.updateStrainCount'] = function (app, msg, cb) {
  app.models.strainCategories.find({}, '_id title strainsCount', function (err, strainCategories) {
    if (err) { return cb(err); }
    async.each(strainCategories, function (category, next) {
      app.models.strains.count({'category._id': category._id}, function (err, count) {
        if (err) { return next(err); }
        if (category.strainsCount !== count) {
          var oldCount = category.strainsCount;
          category.strainsCount = count;
          category.save(function (err) {
            if (err) { return next(err); }
            app.log.info('Strain category "' + category.title + '" strainsCount changed: ' + oldCount + ' -> ' + count + '.');
            next();
          });
        } else {
          next();
        }
      });
    }, cb);
  });
};

exports['db.strainReviews.update'] = exports['db.strainReviews.insert'] = function (app, msg, cb) {
  app.models.strainReviews.findById(msg.body._id, 'strain', function (err, review) {
    if (err) { return cb(err);}
    app.services.mq.push(app, 'events', {name: 'stat.strains.fromReviews', _id: review.strain._id}, cb);
  });
};

exports['stat.strains.fromReviews'] = function (app, msg, cb) {
  async.auto({
    'strain': _.bind(app.models.strains.findById, app.models.strains, msg.body._id),
    'strainEvaluationSpec': function (next) {
      app.models.evaluationSpecs.findOne({target: 'strains'}, next);
    },
    'overallEvaluation': ['strain', 'strainEvaluationSpec', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$group: {_id: null, avgValue: {$avg: '$overallEvaluation.value'}}}
      ], function (err, val) {
        if (err) { return next(err); }
        var specVal;
        if (val.length > 0 && val[0].avgValue > 0) {
          var avg = val[0].avgValue;
          var integer = Math.round(avg);
          specVal = _.find(res.strainEvaluationSpec.values, {value: integer});
          next(null, {value: avg, title: specVal.title});
        } else {
          specVal = _.find(res.strainEvaluationSpec.values, {value: 3});
          next(null, {value: 3, title: specVal.title});
        }
      });
    }],
    reviewCounts: ['strain', function (next, res) {
      async.parallel({
        withEffects: function (next) {
          app.models.strainReviews.count({'strain._id': res.strain._id, 'effects._id': {$exists: true}}, next);
        },
        withConditions: function (next) {
          app.models.strainReviews.count({'strain._id': res.strain._id, 'conditions._id': {$exists: true}}, next);
        },
        withSymptoms: function (next) {
          app.models.strainReviews.count({'strain._id': res.strain._id, 'symptoms._id': {$exists: true}}, next);
        },
        withFlavors: function (next) {
          app.models.strainReviews.count({'strain._id': res.strain._id, 'flavors._id': {$exists: true}}, next);
        }
      }, next);
    }],
    'overallEvaluations': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': res.strain._id}},
        {
          $group: {
            _id: {'evaluationValue': '$overallEvaluation.value'},
            count: {$sum: 1},
            'evaluationTitle': {$first: '$overallEvaluation.title'}
          }
        },
        {$project: {'value': '$_id.evaluationValue', title: '$evaluationTitle', count: '$count', _id: 0}}
      ], next);
    }],
    'animals': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$unwind: '$animals'},
        {
          $group: {
            _id: {_id: '$animals._id', title: '$animals.title', cssClass: '$animals.cssClass'},
            count: {$sum: 1}
          }
        },
        {$project: {_id: '$_id._id', title: '$_id.title', cssClass: '$_id.cssClass', count: '$count'}}
      ], next);
    }],
    'consumptionMethods': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id), 'consumptionMethod._id': {$exists: true}}},
        {
          $group: {
            _id: {
              _id: '$consumptionMethod._id',
              title: '$consumptionMethod.title',
              cssClass: '$consumptionMethod.cssClass'
            }, count: {$sum: 1}
          }
        },
        {$project: {_id: '$_id._id', title: '$_id.title', cssClass: '$_id.cssClass', count: '$count'}}
      ], next);
    }],
    'effects': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$unwind: '$effects'},
        {$unwind: '$effects.evaluations'},
        {
          $group: {
            _id: {_id: '$effects._id', genderId: '$gender._id', evaluationName: '$effects.evaluations.name'},
            genderTitle: {$first: '$gender.title'},
            genderCssClass: {$first: '$gender.cssClass'},
            title: {$first: '$effects.title'},
            evaluationValue: {$avg: '$effects.evaluations.value.value'},
            evaluationTitle: {$first: '$effects.evaluations.title'},
            isPositive: {$first: '$effects.isPositive'},
            count: {$sum: 1}
          }
        },
        {
          $group: {
            _id: {_id: '$_id._id', genderId: '$_id.genderId'},
            genderTitle: {$first: '$genderTitle'},
            genderCssClass: {$first: '$genderCssClass'},
            title: {$first: '$title'},
            evaluations: {
              $push: {
                title: '$evaluationTitle',
                name: '$_id.evaluationName',
                value: {value: '$evaluationValue'}
              }
            },
            isPositive: {$first: '$isPositive'},
            count: {$first: '$count'}
          }
        },
        {
          $project: {
            _id: '$_id._id', gender: {_id: '$_id.genderId', title: '$genderTitle', cssClass: '$genderCssClass'},
            title: true, isPositive: true, count: true, evaluations: 1
          }
        }
      ], next);
    }],
    'conditions': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$unwind: '$conditions'},
        {$unwind: '$conditions.evaluations'},
        {
          $group: {
            _id: {_id: '$conditions._id', evaluationName: '$conditions.evaluations.name'},
            title: {$first: '$conditions.title'},
            evaluationValue: {$avg: '$conditions.evaluations.value.value'},
            evaluationTitle: {$first: '$conditions.evaluations.title'},
            count: {$sum: 1}
          }
        },
        {
          $group: {
            _id: {_id: '$_id._id'},
            title: {$first: '$title'},
            evaluations: {
              $push: {
                title: '$evaluationTitle',
                name: '$_id.evaluationName',
                value: {value: '$evaluationValue'}
              }
            },
            count: {$first: '$count'}
          }
        },
        {$project: {_id: '$_id._id', title: true, count: true, evaluations: 1}}
      ], next);
    }],
    'symptoms': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$unwind: '$symptoms'},
        {$unwind: '$symptoms.evaluations'},
        {
          $group: {
            _id: {_id: '$symptoms._id', genderId: '$gender._id', evaluationName: '$symptoms.evaluations.name'},
            genderTitle: {$first: '$gender.title'},
            genderCssClass: {$first: '$gender.cssClass'},
            title: {$first: '$symptoms.title'},
            evaluationValue: {$avg: '$symptoms.evaluations.value.value'},
            evaluationTitle: {$first: '$symptoms.evaluations.title'},
            count: {$sum: 1}
          }
        },
        {
          $group: {
            _id: {_id: '$_id._id', genderId: '$_id.genderId'},
            genderTitle: {$first: '$genderTitle'},
            genderCssClass: {$first: '$genderCssClass'},
            title: {$first: '$title'},
            evaluations: {
              $push: {
                title: '$evaluationTitle',
                name: '$_id.evaluationName',
                value: {value: '$evaluationValue'}
              }
            },
            count: {$first: '$count'}
          }
        },
        {
          $project: {
            _id: '$_id._id', gender: {_id: '$_id.genderId', title: '$genderTitle', cssClass: '$genderCssClass'},
            title: true, count: true, evaluations: 1
          }
        }
      ], next);
    }],
    'genders': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id), 'gender._id': {$exists: true}}},
        {$group: {_id: {_id: '$gender._id', title: '$gender.title', cssClass: '$gender.cssClass'}, count: {$sum: 1}}},
        {$project: {_id: '$_id._id', title: '$_id.title', cssClass: '$_id.cssClass', count: '$count'}}
      ], next);
    }],
    'zodiacs': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id), 'zodiac._id': {$exists: true}}},
        {$group: {_id: {_id: '$zodiac._id', title: '$zodiac.title', cssClass: '$zodiac.cssClass'}, count: {$sum: 1}}},
        {$project: {_id: '$_id._id', title: '$_id.title', cssClass: '$_id.cssClass', count: '$count'}}
      ], next);
    }],
    'ageCategories': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id), 'ageCategory._id': {$exists: true}}},
        {
          $group: {
            _id: {_id: '$ageCategory._id'},
            count: {$sum: 1},
            'title': {$first: '$ageCategory.title'},
            cssClass: {$first: '$ageCategory.cssClass'}
          }
        },
        {$project: {_id: '$_id._id', title: '$title', cssClass: '$cssClass', count: '$count'}}
      ], next);
    }],
    'flavors': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$unwind: '$flavors'},
        {$unwind: '$flavors.evaluations'},
        {
          $group: {
            _id: {_id: '$flavors._id', evaluationName: '$flavors.evaluations.name'},
            'title': {$first: '$flavors.title'},
            'cssClass': {$first: '$flavors.cssClass'},
            'categoryTitle': {$first: '$flavors.category.title'},
            'categoryId': {$first: '$flavors.category._id'},
            'categoryBgColor': {$first: '$flavors.category.bgColor'},
            'categoryTextColor': {$first: '$flavors.category.textColor'},
            'evaluationValue': {$avg: '$flavors.evaluations.value.value'},
            'evaluationTitle': {$first: '$flavors.evaluations.title'},
            'count': {$sum: 1}
          }
        },
        {
          $group: {
            _id: {_id: '$_id._id'},
            cssClass: {$first: '$cssClass'},
            categoryTitle: {$first: '$categoryTitle'},
            categoryId: {$first: '$categoryId'},
            categoryBgColor: {$first: '$categoryBgColor'},
            categoryTextColor: {$first: '$categoryTextColor'},
            title: {$first: '$title'},
            evaluations: {
              $push: {
                title: '$evaluationTitle',
                name: '$_id.evaluationName',
                value: {value: '$evaluationValue'}
              }
            },
            count: {$first: '$count'}
          }
        },
        {
          $project: {
            _id: '$_id._id',
            cssClass: '$cssClass',
            category: {
              _id: '$categoryId',
              title: '$categoryTitle',
              bgColor: '$categoryBgColor',
              textColor: '$categoryTextColor'
            },
            title: true,
            count: true,
            evaluations: 1
          }
        }
      ], next);
    }],
    'usageTimes': ['strain', function (next, res) {
      app.models.strainReviews.aggregate([
        {$match: {'strain._id': mongoose.Types.ObjectId(res.strain._id)}},
        {$unwind: '$usageTimes'},
        {
          $group: {
            _id: {_id: '$usageTimes._id', title: '$usageTimes.title', cssClass: '$usageTimes.cssClass'},
            count: {$sum: 1}
          }
        },
        {$project: {_id: '$_id._id', title: '$_id.title', cssClass: '$_id.cssClass', count: '$count'}}
      ], next);
    }],
    'files': ['strain', function (next, res) {
      app.models.strainReviews.find({'strain._id': res.strain._id, $where: 'this.files.length > 0'}, 'files', {
        limit: 6,
        sort: {createDate: -1}
      }, function (err, reviews) {
        if (err) { return next(err); }
        // extract first element in each review
        var files = _.map(_.pluck(reviews, 'files'), _.partial(_.first));
        async.map(files, function (file, next) {
          app.models.files.findById(file._id, 'title width height', next);
        }, next);
      });
    }],
    'allEffects': function (next) {
      app.models.strainEffects.find({isAnimal: false}, next);
    },
    'allConsumptionMethods': function (next) {
      app.models.strainConsumptionMethods.find({}, next);
    },
    'allConditions': function (next) {
      app.models.strainConditions.find({isAnimal: false}, next);
    },
    'allSymptoms': function (next) {
      app.models.strainSymptoms.find({isAnimal: false}, next);
    },
    'allUsageTimes': function (next) {
      app.models.usageTimes.find({}, next);
    },
    'allZodiacs': function (next) {
      app.models.zodiacs.find({}, next);
    },
    'allGenders': function (next) {
      app.models.genders.find({}, next);
    },
    'allFlavors': function (next) {
      app.models.strainFlavors.find({}, next);
    },
    'allAgeCategories': function (next) {
      app.models.ageCategories.find({}, next);
    },
    'allAnimals': function (next) {
      app.models.animals.find({}, next);
    },
    'reviewsCount': ['strain', function (next, res) {
      app.models.strainReviews.count({'strain._id': res.strain._id}, next);
    }],
    specs: [function (next) {
      app.models.evaluationSpecs.find({}, next);
    }],
    'effectsEvaluationsTitles': ['effects', 'specs', function (next, res) {
      _.each(res.effects, function (effect) {
        _.each(effect.evaluations, function (ev) {
          var rounded = Math.round(ev.value.value);
          var spec = _.find(res.specs, {target: 'strainEffects', name: ev.name});
          var val = _.find(spec.values, {value: rounded});
          ev.value.title = val ? val.title : rounded;
        });
      });
      next();
    }],
    'symptomsEvaluationsTitles': ['symptoms', 'specs', function (next, res) {
      _.each(res.symptoms, function (symptom) {
        _.each(symptom.evaluations, function (ev) {
          var rounded = Math.round(ev.value.value);
          var spec = _.find(res.specs, {target: 'strainSymptoms', name: ev.name});
          var val = _.find(spec.values, {value: rounded});
          ev.value.title = val ? val.title : rounded;
        });
      });
      next();
    }],
    'conditionsEvaluationsTitles': ['conditions', 'specs', function (next, res) {
      _.each(res.conditions, function (condition) {
        _.each(condition.evaluations, function (ev) {
          var rounded = Math.round(ev.value.value);
          var spec = _.find(res.specs, {target: 'strainConditions', name: ev.name});
          var val = _.find(spec.values, {value: rounded});
          ev.value.title = val ? val.title : rounded;
        });
      });
      next();
    }],
    'flavorsEvaluationsTitles': ['flavors', 'specs', function (next, res) {
      _.each(res.flavors, function (flavor) {
        _.each(flavor.evaluations, function (ev) {
          var rounded = Math.round(ev.value.value);
          var spec = _.find(res.specs, {target: 'strainFlavors', name: ev.name});
          var val = _.find(spec.values, {value: rounded});
          ev.value.title = val ? val.title : rounded;
        });
      });
      next();
    }]
  }, function (err, res) {
    if (err) { return cb(err); }

    var searchIdx = {
      effects: {},
      symptoms: {},
      conditions: {},
      usageTimes: {},
      genders: {},
      ageCategories: {},
      zodiacs: {},
      flavors: {},
      animals: {},
      consumptionMethods: {}
    };

    var avgEvaluations = {
      effects: 0,
      conditions: 0,
      symptoms: 0,
      flavors: 0
    };

    _.each(['effects', 'conditions', 'symptoms', 'flavors'], function (collection) {
      if (res[collection]) {
        var evaluationsCount = 0;
        _.each(res[collection], function (effect) {
          _.each(effect.evaluations, function (evaluation) {
            if (evaluation.value) {
              evaluationsCount += 1;
              avgEvaluations[collection] += evaluation.value.value;
            }
          });
        });
        avgEvaluations[collection] = evaluationsCount ? avgEvaluations[collection] / evaluationsCount : 0;
      }
    });

    _.each(res.allEffects, function (effect) {
      var strainEffect = _.find(res.effects, function (e) {return e._id.toString() === effect._id.toString();});
      searchIdx.effects[effect._id] = {
        includeValue: strainEffect ? 1 : 0,
        excludeValue: strainEffect ? 0 : 1
      };
    });
    _.each(res.allConditions, function (condition) {
      var strainCondition = _.find(res.conditions, function (e) {return e._id.toString() === condition._id.toString();});
      searchIdx.conditions[condition._id] = {
        includeValue: strainCondition ? 1 : 0,
        excludeValue: strainCondition ? 0 : 1
      };
    });
    _.each(res.allSymptoms, function (symptom) {
      var strainSymptom = _.find(res.symptoms, function (e) {return e._id.toString() === symptom._id.toString();});
      searchIdx.symptoms[symptom._id] = {
        includeValue: strainSymptom ? 1 : 0,
        excludeValue: strainSymptom ? 0 : 1
      };
    });
    _.each(res.allUsageTimes, function (usageTime) {
      var strainUsageTime = _.find(res.usageTimes, function (e) {return e._id.toString() === usageTime._id.toString();});
      searchIdx.usageTimes[usageTime._id] = {
        includeValue: strainUsageTime ? 1 : 0,
        excludeValue: strainUsageTime ? 0 : 1
      };
    });
    _.each(res.allZodiacs, function (zodiac) {
      var strainZodiac = _.find(res.zodiacs, function (e) {return e._id.toString() === zodiac._id.toString();});
      searchIdx.zodiacs[zodiac._id] = {
        includeValue: strainZodiac ? 1 : 0,
        excludeValue: strainZodiac ? 0 : 1
      };
    });
    _.each(res.allGenders, function (gender) {
      var strainGender = _.find(res.genders, function (e) {return e._id.toString() === gender._id.toString();});
      searchIdx.genders[gender._id] = {
        includeValue: strainGender ? 1 : 0,
        excludeValue: strainGender ? 0 : 1
      };
    });
    _.each(res.allAgeCategories, function (ageCategory) {
      var strainAgeCategory = _.find(res.ageCategories, function (e) {return e._id.toString() === ageCategory._id.toString();});
      searchIdx.ageCategories[ageCategory._id] = {
        includeValue: strainAgeCategory ? 1 : 0,
        excludeValue: strainAgeCategory ? 0 : 1
      };
    });
    _.each(res.allFlavors, function (flavor) {
      var strainFlavor = _.find(res.flavors, function (e) {return e._id.toString() === flavor._id.toString();});
      searchIdx.flavors[flavor._id] = {
        includeValue: strainFlavor ? 1 : 0,
        excludeValue: strainFlavor ? 0 : 1
      };
    });
    _.each(res.allAnimals, function (animal) {
      var strainAnimal = _.find(res.animals, function (e) {return e._id.toString() === animal._id.toString();});
      searchIdx.animals[animal._id] = {
        includeValue: strainAnimal ? 1 : 0,
        excludeValue: strainAnimal ? 0 : 1
      };
    });
    _.each(res.allConsumptionMethods, function (consumptionMethod) {
      var strainConsumptionMethod = _.find(res.consumptionMethods, function (e) {return e._id.toString() === consumptionMethod._id.toString();});
      searchIdx.consumptionMethods[consumptionMethod._id] = {
        includeValue: strainConsumptionMethod ? 1 : 0,
        excludeValue: strainConsumptionMethod ? 0 : 1
      };
    });
    app.models.strains.update({_id: res.strain._id}, {
      $set: {
        reviewsCount: res.reviewsCount,
        reviewCounts: res.reviewCounts,
        avgEvaluations: avgEvaluations,
        animals: res.animals,
        overallEvaluation: {title: res.overallEvaluation.title, value: res.overallEvaluation.value},
        overallEvaluations: res.overallEvaluations,
        genders: res.genders,
        effects: res.effects,
        flavors: res.flavors,
        conditions: res.conditions,
        symptoms: res.symptoms,
        zodiacs: res.zodiacs,
        ageCategories: res.ageCategories,
        usageTimes: res.usageTimes,
        files: res.files,
        consumptionMethods: res.consumptionMethods,
        searchIdx: searchIdx
      }
    }, cb);
  });
};

