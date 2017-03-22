import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { BuildList, TraitlineList, BuildCollection, SkillsList } from '../imports/api/database.js';

const Gw2API = 'https://api.guildwars2.com/v2/';

Meteor.startup(() => {

});

Meteor.publish('buildlist', () => BuildList.find({}));
Meteor.publish('traitlinelist', () => TraitlineList.find({}));
Meteor.publish('buildcollection', () => BuildCollection.find({}));
Meteor.publish('skillslist', () => SkillsList.find({}));

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

  this.addMinorTraitArray = function addMinorTraitArray(traitArray) {
    this.minor_traits = traitArray;
  };

  this.addMajorTrait = function addMajorTrait(trait) {
    this.major_traits.push(trait);
  };

  this.addMajorTraitArray = function addMajorTraitArray(traitArray) {
    this.major_traits = traitArray;
  };
}

function createRequestString(array) {
  let requestString = array[0];
  for (let i = 1; i < array.length; i += 1) {
    requestString += `,${array[i]}`;
  }
  return requestString;
}

Meteor.methods({
  /*
    Why i dont direct use the API on the client ,because the request are slower and
    the gw2Api sometimes has realy long down times so it is better to buffer the
    everything static (like Skill/Traits) in a own database to take pressure from
    the Gw2Api and so the gw2Api direct requests can be focused on Variable thinks
    like "Auktions Haus" and Charakter things like in witch in Invetory is that item

    Max 600/min requests at moment
  */
  updateGW2APIv2() {
    const time = new Date();
    console.log(`Started Update Gw2Api: ${time}`)
    console.log(`Api-URL: ${Gw2API}`);

    try {
      TraitlineList.remove({});
      const professionsNames = HTTP.call('GET', `${Gw2API}professions`).data;
      let requestString = createRequestString(professionsNames);

      const professions = HTTP.call('GET', `${Gw2API}professions`, { params: { ids: requestString, lang: 'de' } }).data;

      // every class get his request for Traits and Skills
      for (let p = 0; p < professionsNames.length; p += 1) {
        // Trait
        console.log(`Class: ${professionsNames[p]} (${p + 1}|${professionsNames.length}); lang: de`);
        requestString = createRequestString(professions[p].specializations);

        const traitlineArray = HTTP.call('GET', `${Gw2API}specializations`, { params: { ids: requestString, lang: 'de' } }).data;
        console.log(traitlineArray.length);
        for (let t = 0; t < traitlineArray.length; t += 1) {
          const traitline = new Traitline(traitlineArray[t].id, traitlineArray[t].name,
            traitlineArray[t].profession, traitlineArray[t].icon, traitlineArray[t].background);
          // Request Minor Traits
          requestString = createRequestString(traitlineArray[t].minor_traits);
          const minorTraitArray = HTTP.call('GET', `${Gw2API}traits`, { params: { ids: requestString, lang: 'de' } }).data;
          traitline.addMinorTraitArray(minorTraitArray);

          // Request Major Traits
          requestString = createRequestString(traitlineArray[t].major_traits);
          const majorTraitArray = HTTP.call('GET', `${Gw2API}traits`, { params: { ids: requestString, lang: 'de' } }).data;
          traitline.addMajorTraitArray(majorTraitArray);

          // Insert Traitline in to Database
          TraitlineList.insert(traitline);
        } // Traits done
        // Skills
        requestString = professions[p].skills[0].id;
        for (let i = 1; i < professions[p].skills.length; i += 1) {
          requestString += `,${professions[p].skills[i].id}`;
        }

        const skillArray = HTTP.call('GET', `${Gw2API}skills`, { params: { ids: requestString, lang: 'de' } });
        for (let s = 0; s < skillArray.length; s += 1) {
          SkillsList.insert(skillArray[s]);
        }
      }
      console.log('Done');
    } catch (e) {
      console.log(e);
    }
  },
  updateGW2API() {
    // TODO Complete Rebuild for better acessing the endpoints and build up to databases (de/en)
    // TODO Add weapon DB for each class
    // TODO Change the way the api is requested use ?params istead of /_ip
    // because so requests can be bundeld in to one
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
    console.log('Finished Gw2 API Update needed Time: ' + (v / 60) + ' min ' + (v % 60) + ' sec');
  },
});
