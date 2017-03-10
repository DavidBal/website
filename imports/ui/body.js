import { Template } from 'meteor/templating';
import { BuildList } from '../api/database.js';
import { TraitlineList } from '../api/database.js';

import './body.html';
import './traitline.html';

var failcounter = 0;



if(Meteor.isClient){
    var buildtyp = "Das sollte ich überall lesen";
    /**
        Helper
    **/
    Template.main_ClassList.helpers({
        professions(){
            console.log(buildtyp);
            return BuildList.find({} , {sort: {pos: 1}});
        }
    });
    
    Template.profession_ui.helpers({
        buildtyps(){
            console.log(buildtyp);
            //Arbeitet mit den Daten Weitergereichten Daten
            //guarding
            return this && this.profession && this.profession.list;
        }
    });
    
    Template.container_middle.helpers({
        traitline(id){
            return TraitlineList.findOne({id: id});
        }
    });
    
    Template.traitline_ui.helpers({
        minor_trait(traitline, i){
            //guarding
            return traitline && traitline.minor_traits[i];   
        },
        major_trait(traitline, i){
            var traits = [];
            for(var t = i; t < i+3; t++){
                traits.push(traitline && traitline.major_traits[t]);
            }
            return traits;
        }
    });
    
    /**
        Events
    **/
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
