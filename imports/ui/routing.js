/*
  File with all functions that work with routing
*/
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { changeBuild } from './body';


if (Meteor.isClient) {
  /*
    Starting website with out a build "link"/directlink
  */
  Router.route('/', {
    loadingTemplate: 'loading',

    waitOn() {
      // Secure that all Database subscribed and ready for data
      return Meteor.subscribe('buildcollection') && Meteor.subscribe('traitlinelist') && Meteor.subscribe('buildlist') && Meteor.subscribe('skillslist') && Meteor.subscribe('classweaponcollection');
    },

    action() {
      this.render('ui');
    },
  });

  /*
    Starting website with a directlink
  */
  Router.route('/:_link', {
    loadingTemplate: 'loading',

    waitOn() {
      // Secure that all Database subscribed and ready for data
      return Meteor.subscribe('buildcollection') && Meteor.subscribe('traitlinelist') && Meteor.subscribe('buildlist') && Meteor.subscribe('skillslist') && Meteor.subscribe('classweaponcollection');
    },

    action() {
      const link = this.params._link;
      this.render('ui');
      Template.containerMiddle.onRendered(() => changeBuild(link));
    },
  });
}
