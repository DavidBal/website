import { Mongo } from 'meteor/mongo';

export const BuildList = new Mongo.Collection('buildlist');

export const TraitlineList = new Mongo.Collection('traitlinelist');
export const SkillsList = new Mongo.Collection('skillslist');

export const BuildCollection = new Mongo.Collection('buildcollection');
