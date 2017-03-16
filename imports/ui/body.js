import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

//Database entrys
import { BuildList } from '../api/database.js';
import { TraitlineList } from '../api/database.js';
import { BuildCollection } from '../api/database.js';
import { SkillsList } from '../api/database.js';

import './body.html';
import './traitline.html';
import './skills.html';

import './routing.js';

if(Meteor.isClient){
    
    var buildtyp = "Das sollte ich überall lesen";
    var Build = null;
    
    Template.major_trait_ui.onCreated(
        function onCreated() {
            this.trait = new ReactiveVar(this.data.trait);
    });
    
    /**
        Parameter/Variable aus der URL auslesen
    */
    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    function getUrlVar(name) {
        return getUrlVars()[name];
    }
    
    /**
        Helper
    **/
    Template.main_ClassList.helpers({
        professions(){
            return BuildList.find({} , {sort: {pos: 1}});
        }
    });
    
    Template.profession_ui.helpers({
        buildtyps(){
            //Arbeitet mit den Daten Weitergereichten Daten
            //guarding
            return this && this.profession && this.profession.list;
        }
    });
    
    function searchTraitline(id){
        var traitline = TraitlineList.findOne({id: id});
        return traitline;
    };
    
    Template.traitline_ui.helpers({
        minor_trait(traitline, i){
            
            //console.log(traitline);
            
            this.trait = new ReactiveVar(traitline && traitline.minor_traits[i]);
            //guarding
            return traitline && traitline.minor_traits[i];   
        },
        major_trait(traitline, i){
            //console.log(traitline);
            var traits = [];
            for(var t = i; t < i+3; t++){
                traits.push(traitline && traitline.major_traits[t]);
            }
            return traits;
        },
    });
    
    Template.skillbar_ui.helpers({
        skill(skillArray){
            
            skill = SkillsList.findOne({id: skillArray[0]});
            
            this.skill = new ReactiveVar(skill);
            return skill;
        }
    });
    
    /**
        Events
    **/
    
    Template.minor_trait_ui.events({
        'mouseenter .trait'(event, instance) {
            createTraitDropdown(event, instance.data.trait);
        },
        'mouseleave .trait'(event, instance) {
            deleteDropdown();
        },
    });
    
    Template.major_trait_ui.events({
        'mouseenter .trait'(event, instance) {
            createTraitDropdown(event, instance.trait.get());
        },
        'mouseleave .trait'(event, instance) {
            deleteDropdown();
        },
    });
    
    /*Mouseenter event that will show the informantions at the enter position (cursorposition) */
    createTraitDropdown = function (event, trait){
        var style = {
            position: "fixed",
            'z-index': 999,
            top: "10px",
            left: "10px",
            transform: "translate3d(" + event.clientX + "px, " + event.clientY + "px, " + "0px)"
        };
        
        $("#dropdown").html("<div class='trait_dropdown'><h3>" + trait.name + "</h3><div class='trait_description'>" + trait.description + "</div></div>");
        $("#dropdown").css(style);
    }

    /*Mouseleave event will delete the Dropdown if the mouse leave the zone again*/
    deleteDropdown = function (){
        $("#dropdown").html("<!--PlaceHolder-->");
        $("#dropdown").removeAttr('style');
    }
    
    Template.skill_ui.events({
        'mouseenter .skill'(event, instance) {
            console.log(instance);
            
            var style = {
                position: "fixed",
                'z-index': 999,
                top: "10px",
                left: "10px",
                transform: "translate3d(" + event.clientX + "px, " + event.clientY + "px, " + "0px)"
            };
        
            $("#dropdown").html("<div class='skill_dropdown'><h3>" + instance.data.name + "</h3><div class='trait_description'>" + instance.data.description + "</div></div>");
            $("#dropdown").css(style);
        },
        'mouseleave .skill'(event, instance) {
            deleteDropdown();
        }
    });
    
    Template.buildtyp_ui.events({
        /*
            Event that call "Build" all render functions to display the build
        */
        'click .build_name_label': function(event){
            event.preventDefault;
            changeBuild(event.currentTarget.id);
        }
    });
    
  changeBuild = function (link){
        try{
            //guarding
            if(link != (Build && Build.link)){
                //Backup prev Build ,while transition is in progress
                var prevBuild = Build;
                
                //console.log(event.currentTarget.id);
                Build = BuildCollection.findOne({link: link});
                
                //console.log(build);
                //DONE: check if build is valid or undefind
                if(typeof Build === 'undefined'){
                    //Set the Build back to the prevBuild because there will be no change for the User!!
                    //TODO: Add Msg for the User (alert maybe??)
                    Build = prevBuild;
                    throw new Error("De: " + link + " : Das Build konnte in der Datenbank nicht gefunden werden!! / En: " + "The Build was not found in the database!!")
                }
                //Reset the Zones to be clear and ready for the new render
                $('#traitlineZone').html("<!--Traitline Zone-->");
                $('#skillZone').html("<!--Skill Zone-->");
                
                history.replaceState(null, null, link);
                
                for(var i = 1; i < 4 ; i++){
                    createOneTraitline(Build.specializations["traitline_"+i][0]);
                }
                
                createSkillbar(Build.skills);
                
            } else {
                console.log("Load geblockt!")
            }
        } catch (e){
            console.log(e);
            alert(e.message);
        }
    }
    
    /* Call the function the render one Traitline ,and will set the specifc traits activ (opacity = 1)*/
    function createOneTraitline(specialization){
        Blaze.renderWithData( Template.traitline_ui, searchTraitline(specialization.line_id), $( '#traitlineZone' ).get(0));
        //TODO: Move to onRendered function to secure that the DOM is there
        for(var t = 1; t < 4; t++) {
            $("#"+specialization["trait_" + t]).css("opacity", 1);
        }
    }
    
    function createSkillbar(skills){
        Blaze.renderWithData(Template.skillbar_ui, skills, $( '#skillZone' ).get(0))
    }
    
    Template.main_ClassList.events({
        /*Click Event: Open Class Dropdown and close it again if the button is clicked again*/
        'click .klassen_label': function(event){
            event.preventDefault;
            //console.log(buildtyp);
            if($("#"+event.currentTarget.id+"_dropdown").css("display") == "none"){
                $("#"+event.currentTarget.id+"_dropdown").css("display","block");
            } else {
                $("#"+event.currentTarget.id+"_dropdown").css("display","none");
            }
        }
    });
}
