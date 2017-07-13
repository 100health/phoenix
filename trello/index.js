var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
var json;
var async = require('async');

function parseDate(dateString) {
  return dateString ? moment(new Date(dateString)).format("MM/DD/YYYY") : null;
}

function parser(json) {
  if (!json) {
    var contents = fs.readFileSync('extract.json');
    json = JSON.parse(contents.toString());
  }

  var cards = json.cards;
  var members = json.members;
  var actions = json.actions;
  var lists = json.lists;

  console.log("Card Title|List|Started Date|Due Date|Completed|Old Due Dates|Members|Labels|Designs|Githubs|Rice|Reach|Impact|Confidence|Effort");

  _.forEach(json.cards, card => {
    // ignore all cards without a label (too old to care about)
    var cardLabels = _.map(card.labels, l => l.name).join(', ');
    if (cardLabels.length === 0) return

    // ignore the template
    if (card.name === 'Template') return

    // for each card, let's output the relevant dates
    var cardActions = _.filter(actions, a => a.data && a.data.card && a.data.card.id === card.id);

    // what list is this card in right now? 
    var cardList = _.find(lists, l => l.id === card.idList).name;

    // when did we start the project? (actions are an array in reverse chronological order)
    var inProgressAction = _.find(actions, a => a.data && a.data.card && a.data.card.id === card.id && a.data.listAfter && a.data.listAfter.name === 'In Progress');
    inProgressDate = inProgressAction ? parseDate(inProgressAction.date) : null;

    // what is the due date?
    var dueDate = card && card.badges && parseDate(card.badges.due);

    // when was the due date added?
    

    // when was it moved to 'done' or marked complete
    var completedDate;
    if (card.dueComplete) {
        //console.log(JSON.stringify(cardActions, null, 2));
        //console.log(JSON.stringify(card, null, 2))  ;
        completeDate = _.find(cardActions, a => a.type === 'updateCard' && a.data.listAfter && a.data.listAfter.name == 'Done');
    }
    var completedDate = _.find(cardActions, a => a.type === 'updateCard' && a.data.listAfter && a.data.listAfter.name == 'Done');
    completedDate = completedDate ? parseDate(completedDate.date) : null;

    // did the due date for this card change? 
    var dueDateChanged = _.filter(cardActions, a => a.data.card && a.data.card.id === card.id && a.data.old && a.data.old.due);
    var oldDueDates = _.map(dueDateChanged, d => d && d.data && d.data.old && parseDate(d.data.old.due)).join(', ');

    // who worked on this card?
    var cardMembers = _.map(card.idMembers, i => _.find(members, m => m.id === i).fullName);

    // do we have a design attached? 
    var design = _.filter(card.attachments, a => a.url.indexOf("docs.google.com") > -1).length;

    // do we have a github attached?
    var github = _.filter(card.attachments, a => a.url.indexOf("github.com") > -1).length;

    // what are the rice values?
    var rice, reach, impact, confidence, effort;
    var customFieldValues = card.pluginData && card.pluginData.length && card.pluginData[0].value;

    if (customFieldValues) {
      var fields = JSON.parse(customFieldValues).fields;

      rice = fields['zaQHCtAY-KDnkAL'];
      reach = fields['zaQHCtAY-M7Eayf'];
      impact = fields['zaQHCtAY-Cdetcf'];
      confidence = fields['zaQHCtAY-tzOjJE'];
      effort = fields['zaQHCtAY-I4dh9g'];

      // var ricePluginInfo = JSON.parse(_.find(json.pluginData, p => p.idPlugin === '56d5e249a98895a9797bebb9').values);
      // { fields:
      //  [ { n: 'RICE', t: 1, b: 1, id: 'zaQHCtAY-KDnkAL' },
      //    { n: 'Reach', t: 0, id: 'zaQHCtAY-M7Eayf' },
      //    { n: 'Impact', t: 0, id: 'zaQHCtAY-Cdetcf' },
      //    { n: 'Confidence', t: 0, id: 'zaQHCtAY-tzOjJE' },
      //    { n: 'Effort', t: 0, b: 1, id: 'zaQHCtAY-I4dh9g' } ] }
    }

    console.log([card.name, cardList, inProgressDate, dueDate, completedDate, oldDueDates, cardMembers, cardLabels, design, github, rice, reach, impact, confidence, effort].join('|'));
  });

  // _.forEach(json.actions, action => {

  //   if (action.type === 'updateCard' && action.data.listAfter && action.data.listAfter.name == 'Done') {
  //     var card = _.find(cards, c => c.id === action.data.card.id);

  //     // did the due date for this card change? 
  //     var dueDateChanged = _.filter(json.actions, a => a.data.card && a.data.card.id === card.id && a.data && a.data.old && a.data.old.due);
  //     oldDueDates = _.map(dueDateChanged, d => parseDate(d.data.old.due));

  //     //look up the memebers
  //     var idMembers = _.map(card.idMembers, i => _.find(members, m => m.id === i).fullName);

  //     //get labels
  //     var labels = _.map(card.labels, l => l.name);

  //     //get start date - when did this move to in progress
  //     var inProgressAction = _.find(json.actions, a => a.data && a.data.card && a.data.card.id === card.id && a.data.listAfter && a.data.listAfter.name === 'In Progress');
  //     inProgressDate = inProgressAction ? parseDate(inProgressAction.date) : null;

  //     // get design docs and github
  //     var attachments = card.attachments;
  //     var design = _.filter(attachments, a => a.url.indexOf("docs.google.com") > -1);
  //     var github = _.filter(attachments, a => a.url.indexOf("github.com") > -1);

  //     console.log([card.name, inProgressDate, parseDate(card.badges.due), parseDate(action.date), oldDueDates.join(', '), idMembers.join(', '), labels.join(', '), design.length, github.length].join('|'));
  //   }
  // });
}

function trello() {
  // var Trello = require("node-trello");
  // var t = new Trello("e464429c5ae1af6e4b57d090cf8f2c1a", "ef039ca72a08103c51aa4a12d0a568ead57de10df4d97ad7c7dfe98bb0562714");
  // var cards, memebers, actions;

  // t.get("/1/boards/562fc82922c5ffda02df93cf", {
  //   checklists: 'all',
  //   actions: "updateCard",
  //   actions_limit: 1000,
  //   cards: 'all',
  //   cardChecklists: 'all',
  //   members: 'all',
  //   lists: 'all',
  //   card_pluginData: true,
  //   pluginData: true
  // }, (err, json) => {
  //   if (err) {
  //     throw err;
  //   }
  //   parser(json);

  //   console.log(json.actions.length);
  // });
  parser();
}

trello()
