import { Meteor } from 'meteor/meteor';

import { BuildList, TraitlineList, BuildCollection, SkillsList } from '../imports/api/database.js';

import { HTTP } from 'meteor/http';

const Gw2API = 'https://api.guildwars2.com/v2/';

Meteor.startup(() => {

});

Meteor.publish('buildlist', function () { return BuildList.find({}); });
Meteor.publish('traitlinelist', function() {return TraitlineList.find({})});
Meteor.publish('buildcollection', function() {return BuildCollection.find({})});
Meteor.publish('skillslist', function () { return SkillsList.find({}); });

function Traitline(id, name, klasse, icon, background) {
  this.id = id;
  this.name = name;
  this.klasse = klasse;
  this.icon = icon;
  this.background = background;

  this.minor_traits = [];
  this.major_traits = [];

  this.addMinorTrait = function addMinorTrait(trait) {
    this.minor_traits.push(trait);
  };

  this.addMajorTrait = function addMajorTrait(trait) {
    this.major_traits.push(trait);
  };
}

Meteor.methods({
  /*
    Why i dont direct use the API on the client ,because the request are slower and
    the gw2Api sometimes has realy long down times so it is better to buffer the
    everything static (like Skill/Traits) in a own database to take pressure from
    the Gw2Api and so the gw2Api direct requests can be focused on Variable thinks
    like "Auktions Haus" and Charakter things like in witch in Invetory is that item
  */
  updateGW2API() {
    // TODO Complete Rebuild for better acessing the endpoints and build up to databases (de/en)
    /* Function to Update the Database that represent the Gw2 API for esay acess*/
    const time = new Date();
    console.log(`Started Update Gw2 API: ${time}`);
    try {
      const professions = HTTP.call('GET', Gw2API + 'professions').data;
      console.log(professions);

      console.log('   Clearing Database : Traits');
      // Remove everything from the DB
      TraitlineList.remove({});

      console.log('   Clearing Database : Skills');
      // Remove everything from the DB
      SkillsList.remove({});

      for (let i = 0; i < professions.length; i += 1) {
        try {
          const singleProfession = HTTP.call('GET', `${Gw2API}professions/${professions[i]}`, { params: { lang: 'de' } }).data;
          // console.log(singleProfession);
          console.log(`-><---------Traits ${singleProfession.name} (${(i + 1)}/${professions.length})---------><-`);

          /* TraitLines Requests*/
          for (let r = 0; r < singleProfession.specializations.length; r += 1) {
            try {
              const singleTraitLine = HTTP.call('GET', Gw2API + 'specializations/' + singleProfession.specializations[r], { params: { lang: 'de' } }).data;
              // console.log(singleTraitLine.name + ' ; ' + singleTraitLine.id);
              const traitline = new Traitline(singleTraitLine.id, singleTraitLine.name,
                 singleTraitLine.profession, singleTraitLine.icon, singleTraitLine.background);

              // Request Trait:
              // Minor Traits:
              // TODO THROW to prevent failed traitline
              for (let mi = 0; mi < singleTraitLine.minor_traits.length; mi += 1) {
                try {
                  const minor_trait = HTTP.call('GET', Gw2API + 'traits/' + singleTraitLine.minor_traits[mi], { params: { lang: 'de' } }).data;
                  traitline.addMinorTrait(minor_trait);
                } catch (e) {
                  console.log('Failed API Request: MinorTrait id - ' + singleTraitLine.minor_traits[mi]);
                }
              }

              //Major Traits:
              for (let ma = 0; ma < singleTraitLine.major_traits.length; ma += 1) {
                try {
                  const major_trait = HTTP.call('GET', Gw2API + 'traits/' + singleTraitLine.major_traits[ma], { params: { lang: 'de' } }).data;
                  traitline.addMajorTrait(major_trait);
                } catch (e) {
                  console.log('Failed API Request: MajorTrait id - ' + singleTraitLine.major_traits[ma]);
                }
              }

              TraitlineList.insert(traitline);
            } catch (e) {
              console.log('Failed API Request: Specializations/Traitline id - ' + singleProfession.specializations[r]);
            }
          }
          /* Finished Traits*/
          console.log('-><------Finished : Traits ' + singleProfession.name +'('+ (i+1) + '/'+ professions.length + ')' + '------><-')

          /*Skills request*/
          console.log('-><---------Skills: ' + singleProfession.name + '('+ (i+1) + '/'+ professions.length + ')' +'---------><-');
          for (let r = 0; r < singleProfession.skills.length; r += 1) {
            try {
              const singleSkill = HTTP.call('GET', Gw2API + 'skills/' + singleProfession.skills[r].id, {params: {lang: 'de'}}).data;
              // console.log(singleSkill);
              SkillsList.insert(singleSkill);
            } catch (e) {
              console.log('Failed API Request: Skill id - ' + singleProfession.skills[r].id);
            }
          }
          /*Finished SKills*/
          console.log('-><------Finished : Skills ' + singleProfession.name + '('+ (i+1) + '/'+ professions.length + ')' + '------><-');
        } catch (e) {
          console.log('Failed API Request: Profession - ' + professions[i]);
        }
      }
    } catch (e) {
      console.log('Failed Initial Api Request!!');
      console.log(e);
    }
    const v = new Date() - time;
    console.log(v);
    console.log('Finished Gw2 API Update needed Time: ' + (v/60) + ' min ' + (v%60) + ' sec');
  },
});
