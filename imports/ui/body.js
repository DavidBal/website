import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

//Database entrys
import { BuildList } from '../api/database.js';
import { TraitlineList } from '../api/database.js';


import './body.html';
import './traitline.html';

var failcounter = 0;



if(Meteor.isClient){
    var buildtyp = "Das sollte ich überall lesen";
    
    Template.major_trait_ui.onCreated(
        function onCreated() {
            this.trait = new ReactiveVar(this.data.trait);
    });
    
    
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
    
    Template.container_middle.helpers({
        traitline(id){
            return TraitlineList.findOne({id: id});
        },
    });
    
    Template.traitline_ui.helpers({
        minor_trait(traitline, i){
            this.trait = new ReactiveVar(traitline && traitline.minor_traits[i]);
            //guarding
            return traitline && traitline.minor_traits[i];   
        },
        major_trait(traitline, i){
            var traits = [];
            for(var t = i; t < i+3; t++){
                traits.push(traitline && traitline.major_traits[t]);
            }
            return traits;
        },
    });
    
    /**
        Events
    **/
    
    
    
    Template.major_trait_ui.events({
        'mouseenter .trait'(event, instance) {
             var style = {
                position: "fixed",
                'z-index': 999,
                top: "10px",
                left: "10px",
                transform: "translate3d(" + event.clientX + "px, " + event.clientY + "px, " + "0px)"
            };
            $("#trait_dropdown_" + instance.trait.get().specialization).html("<div class='trait_dropdown'><h3>" + instance.trait.get().name + "</h3><div class='trait_description'>" + instance.trait.get().description + "</div></div>");
            $("#trait_dropdown_" + instance.trait.get().specialization).css(style);
        },
        'mouseleave .trait'(event, instance) {
            $("#trait_dropdown_" + instance.trait.get().specialization).html("<!--PlaceHolder-->");
            $("#trait_dropdown_" + instance.trait.get().specialization).removeAttr('style');
        },
    });
    
    Template.minor_trait_ui.events({
        'mouseenter .trait'(event, instance) {
            var style = {
                position: "fixed",
                'z-index': 999,
                top: "10px",
                left: "10px",
                transform: "translate3d(" + event.clientX + "px, " + event.clientY + "px, " + "0px)"
            };
            $("#trait_dropdown_" + instance.data.trait.specialization).html("<div class='trait_dropdown'><h3>" + instance.data.trait.name + "</h3><div class='trait_description'>" + instance.data.trait.description + "</div></div>");
            $("#trait_dropdown_" + instance.data.trait.specialization).css(style);
        },
        'mouseleave .trait'(event, instance) {
            $("#trait_dropdown_" + instance.data.trait.specialization).html("<!--PlaceHolder-->");
            $("#trait_dropdown_" + instance.data.trait.specialization).removeAttr('style');
        },
    });
    
    
    Template.main_ClassList.events({
        //Click Event: Open Class Dropdown
        'click .klassen_label': function(event){
            event.preventDefault;
            console.log(buildtyp);
            if($("#"+event.currentTarget.id+"_dropdown").css("display") == "none"){
                $("#"+event.currentTarget.id+"_dropdown").css("display","block");
            } else {
                $("#"+event.currentTarget.id+"_dropdown").css("display","none");
            }
        }
    });
}
