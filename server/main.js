import { Meteor } from 'meteor/meteor';

import { BuildList } from '../imports/api/database.js';
import { TraitlineList } from '../imports/api/database.js';
import { BuildCollection } from '../imports/api/database.js';
import { SkillsList } from '../imports/api/database.js';

import { HTTP } from 'meteor/http';

var Gw2API = "https://api.guildwars2.com/v2/";

Meteor.startup(() => {

});

Meteor.publish("buildlist", function(){return BuildList.find({})});
Meteor.publish("traitlinelist", function(){return TraitlineList.find({})});
Meteor.publish("buildcollection", function(){return BuildCollection.find({})});
Meteor.publish("skillslist", function(){return SkillsList.find({})});

Meteor.methods({
    'testconsol': function () {
        console.log("Dies ist ein Test");
    },
    'updateGW2API': function () {
        /* Function to Update the Database that represent the Gw2 API for esay acess*/
        //TODO to owen functions
        
        var time = new Date();
        console.log("Started Update Gw2 API: " + time);
        
        try{
            var professions = HTTP.call("GET", Gw2API + "professions").data;
            console.log(professions);
            
            console.log("   Clearing Database : Traits");
            //Remove everything from the DB
            TraitlineList.remove({});
            console.log("   Clearing Database : Skills");
            //Remove everything from the DB
            SkillsList.remove({});
            
            for(var i = 0; i < professions.length; i++){
                try{
                    var singleProfession = HTTP.call("GET", Gw2API + "professions/" + professions[i],  {params: {lang: "de"}}).data;
                    //console.log(singleProfession);
                    
                    console.log("-><---------Traits " + singleProfession.name + "("+ (i+1) + "/"+ professions.length + ")" + "---------><-");
                    
                    /*TraitLines Requests*/
                    for (var r = 0 ; r < singleProfession.specializations.length; r++){
                        try{
                            var singleTraitLine = HTTP.call("GET", Gw2API + "specializations/" + singleProfession.specializations[r], {params: {lang: "de"}}).data;
                            //console.log(singleTraitLine.name + " ; " + singleTraitLine.id);
                            var traitline = new Traitline(singleTraitLine.id, singleTraitLine.name, singleTraitLine.profession, singleTraitLine.icon, singleTraitLine.background);
                            
                            //Request Trait:
                            //Minor Traits:
                            //TODO THROW to prevent failed traitline
                            for(var mi=0; mi < singleTraitLine.minor_traits.length; mi++){
                                try{
                                    var minor_trait = HTTP.call("GET", Gw2API + "traits/" + singleTraitLine.minor_traits[mi], {params: {lang: "de"}}).data;
                                    traitline.addMinorTrait(minor_trait);
                                } catch (e) {
                                   console.log("Failed API Request: MinorTrait id - " + singleTraitLine.minor_traits[mi]); 
                                }
                            }
                            
                            //Major Traits:
                            for(var ma=0; ma < singleTraitLine.major_traits.length; ma++){
                                try{
                                    var major_trait = HTTP.call("GET", Gw2API + "traits/" + singleTraitLine.major_traits[ma], {params: {lang: "de"}}).data;
                                    traitline.addMajorTrait(major_trait);
                                } catch (e) {
                                   console.log("Failed API Request: MajorTrait id - " + singleTraitLine.major_traits[ma]); 
                                }
                            } 
                            
                            TraitlineList.insert(traitline);
                            
                        } catch (e) {
                             console.log("Failed API Request: Specializations/Traitline id - " + singleProfession.specializations[r]);
                             
                        }
                        
                        
                    }
                    /*Finished Traits*/
                    console.log("-><------Finished : Traits " + singleProfession.name +"("+ (i+1) + "/"+ professions.length + ")" + "------><-")
                    
                    /*Skills request*/
                    console.log("-><---------Skills: " + singleProfession.name + "("+ (i+1) + "/"+ professions.length + ")" +"---------><-");
                    
                    for(var r = 0; r < singleProfession.skills.length; r++){
                        try{
                            var singleSkill = HTTP.call("GET", Gw2API + "skills/" + singleProfession.skills[r].id, {params: {lang: "de"}}).data;
                            //console.log(singleSkill);
                            SkillsList.insert(singleSkill);
                        
                        } catch (e) {
                            console.log("Failed API Request: Skill id - " + singleProfession.skills[r].id);
                        }
                    }
                    
                    /*Finished SKills*/
                    console.log("-><------Finished : Skills " + singleProfession.name + "("+ (i+1) + "/"+ professions.length + ")" + "------><-")
                    
                    
                } catch (e) {
                    console.log("Failed API Request: Profession - " + professions[i]);
                }
            }
            
        } catch (e) {
            console.log("Failed Initial Api Request!!");
            console.log(e);
        }
        
        var v = new Date() - time;
        console.log(v);
        console.log("Finished Gw2 API Update needed Time: " + (v/60) + " min " + (v%60) + " sec");
    }
    
});

function Traitline(id, name, klasse ,icon, background){
        this.id = id;
        this.name = name;
        this.klasse = klasse;
        this.icon = icon;
        this.background = background;
        
        this.minor_traits = [];
        this.major_traits= [];
        
        this.addMinorTrait = function (trait){
            this.minor_traits.push(trait);
        };
        
        this.addMajorTrait = function (trait){
            this.major_traits.push(trait);
        };        
}