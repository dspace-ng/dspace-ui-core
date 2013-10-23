//jQuery(function() {

$(function() {
  //$ = jQuery;
  var Faye = require('faye');

  var BayeuxHub = require('dspace-api-bayeux/hub');
  var HTTPHub = require('dspace-api-core/hubs/http');

  var templates = {
   comment:  require('../templates/comment.hbs'),
   form: require('../templates/form.hbs')
  };

  //FIXME move to config
  var http_url = 'http://144.76.177.115:5333';
  var bayeux_url = 'http://144.76.177.115:5333/bayeux';

  //Backbone.$ = jQuery;

  var $el = $("#dspace-conversation");
  var hashtag = $el[0].className;
  $el.append(templates.form({ hashtag: hashtag }));
  $el.append('<ul style="height: 600px;overflow:visible;list-style-type:circle;"></ul>');


  var hub = {
    http: new HTTPHub(http_url),
    bayeux: new BayeuxHub(bayeux_url)
  };

  var channel = {
    history: hub.http.getFeed('/hashtags/' + hashtag.toLowerCase()),
    live: hub.bayeux.getChannel('/hashtags/' + hashtag.toLowerCase())
  };

  $el.find('form').on('submit', function(event){
    event.preventDefault();
    window.foo = event;
    var comment = {
      text: event.target[0].value,
      timestamp: new Date().getTime(),
      persona: {
        handle: "e13openmic@elevate.at",
        url: "2013.elevate.at/e13openmic"
      }
    };
    channel.live.pub(comment);
    event.target.reset();
  });

  var Comment = Backbone.Model.extend({

  });

  var CommentView = Backbone.View.extend({

    tagName: 'li',
    template: templates.comment,

    initialize: function(){
      this.render();
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      $('#dspace-conversation ul').prepend(this.el);
      return this.el;
    }

  });

  var Conversation = Backbone.Collection.extend({

    model: Comment,

    initialize: function(attrs, options){
      _.bindAll(this, 'set', 'add');

      this.channel = options.channel;
      this.channel.history.pull(this.set);
      this.channel.live.sub(this.add);
    }

  });

  var conversation = new Conversation([], { channel: channel });
  conversation.on('add', function(comment){
    new CommentView({ model: comment });
  });

});

