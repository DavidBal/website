/*
  File with all functions that work with routing
*/
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { changeBuild } from './body';


if (Meteor.isClient) {
  Router.route('/', {
    loadingTemplate: 'loading',

    waitOn() {
      return Meteor.subscribe('buildcollection') && Meteor.subscribe('traitlinelist') && Meteor.subscribe('buildlist') && Meteor.subscribe('skillslist');
    },

    action() {
      this.render('ui');
    },
  });

  Router.route('/:_link', {
    loadingTemplate: 'loading',

    waitOn() {
      return Meteor.subscribe('buildcollection') && Meteor.subscribe('traitlinelist') && Meteor.subscribe('buildlist') && Meteor.subscribe('skillslist');
    },

    action() {
      const link = this.params._link;
      console.log(link);
      this.render('ui');
      Template.containerMiddle.onRendered(() => changeBuild(link));
    },
  });
}
