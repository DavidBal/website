import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import { Meteor } from 'meteor/meteor';

// Database entrys
import { BuildList, TraitlineList, BuildCollection, SkillsList, ClassWeaponCollection } from '../api/database';

import './body.html';
import './traitline.html';
import './skills.html';
import './weapon.html';
import { Dropdown } from './dropdown';

import './routing';

if (Meteor.isClient) {
  let Build = null;

  // Functions
  const searchTraitline = function searchTraitline(id) {
    const traitline = TraitlineList.findOne({ id });
    return traitline;
  };

  /*
    Call the function the render one Traitline ,and will set the specifc traits activ (opacity = 1)
  */
  const createOneTraitline = function createOneTraitline(specialization) {
    Blaze.renderWithData(Template.traitlineUi, searchTraitline(specialization.line_id), $('#traitlineZone').get(0));
    // TODO: Move to onRendered function to secure that the DOM is there
    for (let t = 1; t < 4; t += 1) {
      // $("#"+specialization["trait_" + t]).css('opacity', 1);
      $(`#${specialization[`trait_${t}`]}`).css('opacity', 1);
    }
  };

  const createSkillbar = function createSkillbar(skills) {
    Blaze.renderWithData(Template.skillbarUi, skills, $('#skillZone').get(0));
  };

  const createWeaponSkillbar = function createWeaponSkillbar(weapon) {
    const weaponSkillArray = ClassWeaponCollection.findOne({ typ: weapon, klasse: Build.profession }).skills;
    console.log(weaponSkillArray);
    Blaze.renderWithData(Template.weaponSkillbarUi, weaponSkillArray, $('#weaponSkillZone').get(0));
  };

  export default 0;

  /*
    Change the activ Build
    link - the database link (id)
    export because this function is also used by the Routing for start rendering
  */
  export const changeBuild = function changeBuild(link) {
    try {
      // guarding
      if (link !== (Build && Build.link)) {
        // Backup prev Build ,while transition is in progress
        const prevBuild = Build;

        // console.log(event.currentTarget.id);
        // Search the new build with the given link
        Build = BuildCollection.findOne({ link });

        // console.log(build);
        // DONE: check if build is valid or undefind
        if (typeof Build === 'undefined') {
          // Set the Build back to the prevBuild because there will be no change for the User!!
          // TODO: Add Msg for the User -> load a diffrent Template
          Build = prevBuild;
          throw new Error(`De: ${link} :Das Build konnte in der Datenbank nicht gefunden werden!! / En: + The Build was not found in the database!!`);
        }
        // Reset the Zones to be clear and ready for the new render
        $('#traitlineZone').html('<!--Traitline Zone-->');
        $('#skillZone').html('<!--Skill Zone-->');
        $('#weaponSkillZone').html('<!---->');
        $('#build_name').html('<!--Build Name-->');

        // Change the Browser for Link for fast Sharing of the Build
        history.replaceState(null, null, link);
        $('#build_name').html(`${Build.klasse}`);
        for (let i = 1; i < 4; i += 1) {
          createOneTraitline(Build.specializations[`traitline_${i}`][0]);
        }

        createSkillbar(Build.skills);
        createWeaponSkillbar(Build.weapons[0]);
      } else {
        // No action the build is already up
        // console.log('Load geblockt!');
      }
    } catch (e) {
      // console.log(e);
      // TODO Render <div> with debug infos
    }
  };

  Template.majorTraitUi.onCreated(
    function onCreated() {
      this.trait = new ReactiveVar(this.data.trait);
    },
  );

    /**
        Helper
    **/
  Template.mainClassList.helpers({
    professions() {
      return BuildList.find({}, { sort: { pos: 1 } });
    },
  });

  Template.professionUi.helpers({
    buildtyps() {
      // Arbeitet mit den Daten Weitergereichten Daten
      // guarding
      return this && this.profession && this.profession.list;
    },
  });

  Template.traitlineUi.helpers({
    minor_trait(traitline, i) {
      // console.log(traitline);
      this.trait = new ReactiveVar(traitline && traitline.minor_traits[i]);
      // guarding
      return traitline && traitline.minor_traits[i];
    },
    major_trait(traitline, i) {
      // console.log(traitline);
      const traits = [];
      for (let t = i; t < (i + 3); t += 1) {
        traits.push(traitline && traitline.major_traits[t]);
      }
      return traits;
    },
  });

  Template.skillbarUi.helpers({
    skill(skillArray) {
      // Search the Skill with the id
      const skill = SkillsList.findOne({ id: skillArray[0] });
      // Set the Skill
      this.skill = new ReactiveVar(skill);
      return skill;
    },
  });

  Template.weaponSkillbarUi.helpers({
    weaponSkill(position) {
      console.log(this);
      const skill = SkillsList.findOne({ id: this[position] });
      console.log(skill);
      this.skill = new ReactiveVar(skill);
      return skill;
    },
  });

  /**
        Events
  **/
  Template.minorTraitUi.events({
    'mouseenter .trait': function onEnter(event, templateInstance) {
      if (typeof this.dropdown === 'undefined') {
        this.dropdown = new ReactiveVar(new Dropdown(event, templateInstance.data.trait));
      }
      this.dropdown.get().render();
    },
    'mousemove .trait': function onMove(event) {
      this.dropdown.get().move(event);
    },
    'mouseleave .trait': function onLeave() {
      Dropdown.remove();
    },
  });

  Template.majorTraitUi.events({
    'mouseenter .trait': function onEnter(event, templateInstance) {
      if (typeof this.dropdown === 'undefined') {
        this.dropdown = new ReactiveVar(new Dropdown(event, templateInstance.trait.get()));
      }
      this.dropdown.get().render();
    },
    'mousemove .trait': function onMove(event) {
      this.dropdown.get().move(event);
    },
    'mouseleave .trait': function onLeave() {
      Dropdown.remove();
    },
  });

  Template.skillUi.events({
    'mouseenter .skill_icon': function onEnter(event, templateInstance) {
      if (typeof this.dropdown === 'undefined') {
        this.dropdown = new ReactiveVar(new Dropdown(event, templateInstance.data));
      }
      this.dropdown.get().render();
    },
    'mousemove .skill_icon': function onMove(event) {
      this.dropdown.get().move(event);
    },
    'mouseleave .skill_icon': function onLeave() {
      Dropdown.remove();
    },
    'click .skill_change': function onCLick(event) {
      console.log('Click');
      console.log(event);
      // TODO Pop up menue with alternativ skills
    },
  });

  Template.weaponSkillUi.events({
    'mouseenter .skill_icon': function onEnter(event, templateInstance) {
      if (typeof this.dropdown === 'undefined') {
        console.log(templateInstance.data);
        this.dropdown = new ReactiveVar(new Dropdown(event, templateInstance.data));
      }
      this.dropdown.get().render();
    },
    'mousemove .skill_icon': function onMove(event) {
      this.dropdown.get().move(event);
    },
    'mouseleave .skill_icon': function onLeave() {
      Dropdown.remove();
    },
  });

  Template.buildtypUi.events({
    /*
      Event that call "Build" all render functions to display the build
    */
    'click .build_name_label': function onCLick(event) {
      event.preventDefault();
      changeBuild(event.currentTarget.id);
    },
  });

  Template.mainClassList.events({
    /*
      Click Event: Open Class Dropdown and close it again if the button is clicked again
    */
    'click .klassen_label': function onCLick(event) {
      event.preventDefault();
      // console.log(buildtyp);
      if ($(`#${event.currentTarget.id}_dropdown`).css('display') === 'none') {
        $(`#${event.currentTarget.id}_dropdown`).css('display', 'block');
      } else {
        $(`#${event.currentTarget.id}_dropdown`).css('display', 'none');
      }
    },
  });
}
