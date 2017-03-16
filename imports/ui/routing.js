/*File with all functions that work with routing*/

import './body.js';

if(Meteor.isClient){
    require('./body.js');
    Router.route('/', {
        loadingTemplate: 'loading',
        
        waitOn: function(){
            return Meteor.subscribe("buildcollection") && Meteor.subscribe("traitlinelist") && Meteor.subscribe("buildlist") && Meteor.subscribe("skillslist");
        },
        
        action: function(){
            this.render('ui');
        }
    });
        
    Router.route('/:_link', {
        loadingTemplate: 'loading',
        
        waitOn: function(){
            return Meteor.subscribe("buildcollection") && Meteor.subscribe("traitlinelist") && Meteor.subscribe("buildlist") && Meteor.subscribe("skillslist");
        },
        
        action: function(){
            var link = this.params._link;
            console.log(link);
            this.render('ui');
            Template.container_middle.onRendered(function (){changeBuild(link)});
            
        }
    });
}