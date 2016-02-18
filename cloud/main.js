var CLIPO_MESSAGE = 'ClipoMessage';
const CLIPO_TEAM = 'CPTeam';
const CLIPO_PROJECT = 'CPProject';
const CLIPO_TOPIC = 'CPTopic';
const CLIPO_FILE = 'CPFile';
const CLIPO_COMMENT = 'CPComment';
const CLIPO_NOTIFICATION = 'CPNotif';
const CHANNEL_PREFIX = 'channel_';
const SEND_TO_PUBNUB = 'sendToPubNub';
const SEDN_PUSH = 'sendPush';
const SAVE_NOTIFICATION = 'saveNotif';

var SOURCE_MOBILE = 'mobile';
var pubnub = { 
    	'publish_key'   : 'pub-c-9ff0b4eb-292b-46a0-bf5d-90b79ed90768', 
    	'subscribe_key' : 'sub-c-42c5f87e-0972-11e5-9ffb-0619f8945a4f'
};

Parse.Cloud.afterSave('ClipoProject', function(request){
	var channel_name = 'channel_clipo';
	var content = request.object.toJSON();
	Parse.Cloud.run('sendToPubNub', {
		channel_name: channel_name,
		content: content
	}, {
		success: function(httpResponse){
			console.log('success: ' + httpResponse.text);
		},
		error: function(httpResponse){
			console.log('success: ' + httpResponse.text);
		}
	});
	var queryActiveInstallation = new Parse.Query(Parse.Installation);
	queryActiveInstallation.equalTo('isOnline', false);
	Parse.Push.send({
		where: queryActiveInstallation,
		data: {
			alert: content.owner_name.toString() + " added a new project",
			badge: "Increment"
		}
	}, 
	{
		success: function(){
			console.log('push sent');
		},
		error: function(){
			console.log('push sent failed');
		}
	});

});

Parse.Cloud.afterSave(CLIPO_MESSAGE, function(request){
	var channel_name = 'channel_clipo';
	var content = request.object.toJSON(); 

	Parse.Cloud.run('sendToPubNub', {
		channel_name: channel_name, 
		content: content
	},
	{
		success: function(httpResponse){
			console.log('success: ' + httpResponse.text);
		},
		error: function(httpResponse){
			console.log('error: ' + httpResponse.text);
		}
	});
	var queryActiveInstallation = new Parse.Query(Parse.Installation);
	queryActiveInstallation.equalTo('isOnline', false);
	Parse.Push.send({
		where: queryActiveInstallation,
		data: {
			alert: content.from.toString() + " send u a message",
			badge: "Increment"
		}
	}, 
	{
		success: function(){
			console.log('push sent');
		},
		error: function(){
			console.log('push sent failed');
		}
	});
	
});

Parse.Cloud.afterSave(CLIPO_TOPIC, function(request){
	var object = request.object.toJSON();
	var channel_name = CHANNEL_PREFIX + object.parent.objectId;
	var content = {
		name: object.name,
		objectId: object.objectId,
		mongoId: object.mongoId
	}
	Parse.Cloud.run(SEND_TO_PUBNUB, {
		channel_name: channel_name,
		content: content
	}, 
	{
		success: function(httpResponse){
			console.log(httpResponse.text);
		},
		error: function(httpResponse){
			console.log('Error: ' + httpResponse.text);
		}
	});


});

Parse.Cloud.define(SEND_TO_PUBNUB, function(request, response){
	Parse.Cloud.httpRequest({
		url: 'http://pubsub.pubnub.com/publish/' + pubnub.publish_key + '/' 
		+ pubnub.subscribe_key + '/0/' + request.params.channel_name + 
		 '/0/' + encodeURIComponent(JSON.stringify(request.params.content))
	});
});


/*
	request's object: {
		project: CPProject,
		sender: CPUser name,
		action: "ADD" | "REVISE" | "DELETE",
		target: CPFile | CPComment | CPUser | CPProject | CPTopic,
		date: date
	}
*/
Parse.Cloud.define(SEDN_PUSH, function(request, response){

});

Parse.Cloud.define('')

// Parse.Cloud.define('syncToMeteor', function(request, response){
// 	Parse.Cloud.httpRequest({
// 		url: ''
// 	});
// });
