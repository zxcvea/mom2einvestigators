$(document).ready(function() {
  App.Start();
});

var Investigators;

var GlobalVariables = {
  DEFAULTSOURCE: 'investigator-presets.js',
  DATASOURCE: 'investigator-presets.js',
  RESET: false,
  STARTUP: true,
};

var App = {

  Process: function(url) {
    url = Data.Clean(url);
    $.ajax({
      dataType: "json",
      url: url,
      async: false,
      success: function(data) {
        Investigators = data.Investigators;
        if (GlobalVariables.STARTUP) {
          Template.Init();
          GlobalVariables.STARTUP = false;
        } else {
          Template.Refresh();
          if (GlobalVariables.DATASOURCE != GlobalVariables.DEFAULTSOURCE && !GlobalVariables.RESET) {
            $('#data-message').removeClass('error');
            $('#data-message').text('Datasource updated. Using custom Investigators.');
          } else if (GlobalVariables.RESET) {
            $('#data-message').removeClass('error');
            $('#data-message').text('Using Default Investigators.');
          }
        }
      },
      error: function() {
        $('#data-message').addClass('error');
        $('#data-message').text('Could not get data.');
        alert(0);
      }
    });
  },

  Start: function() {
    App.Process(GlobalVariables.DATASOURCE);
  }

};

var Template = {

  DEFAULT_WIDTH: 1406,
  DEFAULT_HEIGHT: 815,
  WINDOW_WIDTH: 0,
  WINDOW_HEIGHT: 0,
  INNER_LEFT: 0,
  INVESTIGATOR_INDEX: 0,
  DISPLAY_SETTINGS: false,
  SHOW_STORY: false,
  FULLSCREEN: false,

  Setup: function() {
    var container = '<div id="main"><div id="container"><div id="inner"></div></div></div>';
    $('body').append(container);
    var settingsBtn = '<a href="javascript:void(0);" id="btn-settings">&nbsp;</a>';
    var enterfsBtn = '<a href="javascript:void(0);" id="btn-enterfs">&nbsp;</a>';
    var exitfsBtn = '<a href="javascript:void(0);" id="btn-exitfs">&nbsp;</a>';
    $('#container').append(settingsBtn);
    $('#container').append(enterfsBtn);
    $('#container').append(exitfsBtn);

    var settingsCtn = '<div id="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding"><h2>Settings</h2><label>Custom Investigators:</label><p>To use your own custom investigators, paste the url of your data JS file. <a href="info/">Find out more</a>.</p><p><span id="data-message"></span></p><div class="input-ctn"><input type="text" id="datasource" /></div><a href="javascript:void(0);" id="btn-update-data" class="btn">Update</a><a href="javascript:void(0);" id="btn-reset-data" class="btn">Reset</a></div></div>';
    $('body').append(settingsCtn);
    $('#btn-exitfs, #settings').hide();
  },

  BuildTemplate: function(investigator) {
    var profile = '<div id="profile-image"><img src="' + investigator.Image + '" /></div><div id="profile-name" class="noselect">' + investigator.Name + '</div><div id="profile-job" class="noselect">' + investigator.Job + '</div>';
    var ability = '<div id="ability" class="noselect">' + Data.Replace(investigator.Ability) + '</div>';
    var stats = '<div id="stats"><div id="stats-damage" class="stat-' + investigator.Stats.Damage + '"></div><div id="stats-horror" class="stat-' + investigator.Stats.Horror + '"></div></div>';
    var attributes = '<div id="attributes"><div id="attributes-strength" class="attribute-' + investigator.Attributes.Strength + '"></div><div id="attributes-agility" class="attribute-' + investigator.Attributes.Agility + '"></div><div id="attributes-observation" class="attribute-' + investigator.Attributes.Observation + '"></div><div id="attributes-lore" class="attribute-' + investigator.Attributes.Lore + '"></div><div id="attributes-influence" class="attribute-' + investigator.Attributes.Influence + '"></div><div id="attributes-will" class="attribute-' + investigator.Attributes.Will + '"></div></div>';
    var story = '<div id="story">' + Data.Format(investigator.Story) + '</div>';

    var template = '<div class="template"><div class="inner"><div class="front">' + profile + ability + stats + attributes + '</div><div class="back">' + story + '</div></div></div>';
    $('#inner').append(template);
  },

  CreateInvestigators: function() {
    jQuery.each(Investigators, function(index, investigator) {
      Template.BuildTemplate(investigator);
    });

  },

  Refresh: function() {
    $('.template').remove();
    $('#inner').css('left', 0);
    Template.INNER_LEFT = 0;
    Template.CreateInvestigators();
    Template.INVESTIGATOR_INDEX = 0;
  },

  Navigate: function(direction) {
    if (direction == 'right' && Template.INVESTIGATOR_INDEX == (Investigators.length - 1)) {
      return;
    }

    if (direction == 'left' && Template.INVESTIGATOR_INDEX == 0) {
      return;
    }

    Template.INVESTIGATOR_INDEX = (direction == 'right') ? Template.INVESTIGATOR_INDEX + 1 : Template.INVESTIGATOR_INDEX - 1;
    leftPos = Template.INNER_LEFT;
    if (direction == 'right') {
      movePos = leftPos - $('#container').width();
    } else {
      movePos = leftPos + $('#container').width();
    }
    Template.INNER_LEFT = movePos;
    $('#inner').animate({
      left: movePos + 'px'
    }, 300, function() {
      $('.template .inner').css('top', '0');
      Template.SHOW_STORY = false;
    });
  },

  ShowStory: function(direction) {
    if (direction == 'up' && !Template.SHOW_STORY) {
      Template.SHOW_STORY = true;
      var movePos = $('#container').height();
      $('.inner:eq(' + Template.INVESTIGATOR_INDEX + ')').animate({
        top: -movePos + 'px'
      }, 300);
    } else if (direction == 'down' && Template.SHOW_STORY) {
      Template.SHOW_STORY = false;
      $('.inner:eq(' + Template.INVESTIGATOR_INDEX + ')').animate({
        top: '0'
      }, 300);
    }
  },

  Scale: function() {
    var scale, origin;

    var lr = Template.DEFAULT_WIDTH / Template.DEFAULT_HEIGHT;
    var pr = Template.DEFAULT_HEIGHT / Template.DEFAULT_WIDTH;
    var wr = $(window).width() / $(window).height();
    if (wr >= 1) {
      // landscape
      if ($(window).width() >= Template.DEFAULT_WIDTH && $(window).height() >= Template.DEFAULT_HEIGHT) {
        scale = 1;
      } else if (wr >= lr) {
        scale = $(window).height() / Template.DEFAULT_HEIGHT;
      } else {
        scale = $(window).width() / Template.DEFAULT_WIDTH;
      }
    } else {
      // portrait
      if ($(window).height() >= Template.DEFAULT_WIDTH && $(window).width() >= Template.DEFAULT_HEIGHT) {
        scale = 1;
      } else if (wr <= pr) {
        scale = $(window).width() / Template.DEFAULT_HEIGHT;
      } else {
        scale = $(window).height() / Template.DEFAULT_WIDTH;
      }
    }

    $('#container, #settings').css({
      transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
    });

    $('#inner').width(Investigators.length * $('#container').width());
  },

  Events: function() {
    var hitArea = document.getElementById('container');
    var hammer = new Hammer(hitArea);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("swipeleft", function(ev) {
      if (!Template.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio >= 1) {
          Template.Navigate('right');
        } else {
          Template.ShowStory('down');
        }
      }
    });
    hammer.on("swiperight", function(ev) {
      if (!Template.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio >= 1) {
          Template.Navigate('left');
        } else {
          Template.ShowStory('up');
        }
      }
    });
    hammer.on("swipeup", function(ev) {
      if (!Template.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio < 1) {
          Template.Navigate('right');
        } else {
          Template.ShowStory('up');
        }
      }
    });
    hammer.on("swipedown", function(ev) {
      if (!Template.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio < 1) {
          Template.Navigate('left');
        } else {
          Template.ShowStory('down');
        }
      }
    });

    $(document).click(function() {
      if ($('#container').width() != Template.WINDOW_WIDTH || $('#container').height() != Template.WINDOW_HEIGHT) {
        Template.Scale();
      }
    });

    $(document).on('click', '#btn-enterfs', function(){
      Template.ToggleFullscreen();
    });

    $(document).on('click', '#btn-exitfs', function(){
      Template.ToggleFullscreen();
    });

    $(document).on('click', '#btn-settings', function(){
      if (!Template.DISPLAY_SETTINGS) {
        var height = $('#container').height();
        $('#settings').show();
        Template.DISPLAY_SETTINGS = true;
        $('#btn-exitfs, #btn-enterfs, #btn-settings').hide();
      }
    });

    $(document).on('click', '#btn-exit-settings', function(){
      if (Template.DISPLAY_SETTINGS) {
        var movePos = $('#container').height();
        $('#settings').hide();
        Template.DISPLAY_SETTINGS = false;
        if (Template.FULLSCREEN) {
          $('#btn-enterfs').hide();
          $('#btn-exitfs, #btn-settings').show();
        } else {
          $('#btn-enterfs, #btn-settings').show();
          $('#btn-exitfs').hide();
        }
        $('#data-message').text('');
      }
    });

    $(document).on('click', '#btn-update-data', function(){
      GlobalVariables.RESET = false;
      var datasource = $('#datasource').val();
      GlobalVariables.DATASOURCE = datasource;
      App.Process(GlobalVariables.DATASOURCE);
    });

    $(document).on('click', '#btn-reset-data', function(){
      GlobalVariables.RESET = true;
      $('#datasource').val('');
      GlobalVariables.DATASOURCE = GlobalVariables.DEFAULTSOURCE;
      App.Process(GlobalVariables.DATASOURCE);
    });
  },

  ToggleFullscreen: function() {
    if (!Template.FULLSCREEN) {
      Template.FULLSCREEN = true;
      document.documentElement.requestFullscreen();
      $('#btn-enterfs').hide();
      $('#btn-exitfs').show();
    } else {
      Template.FULLSCREEN = false;
      document.exitFullscreen();
      $('#btn-enterfs').show();
      $('#btn-exitfs').hide();
    }
  },

  Init: function() {
    Template.Setup();
    Template.CreateInvestigators();
    Template.Events();
    Template.Scale();
  }

};

var Data = {

  Replace: function (text) {
    text = text.replace('\n', '<br />');
    text = text.replace('{{', '<strong>');
    text = text.replace('}}', '</strong>');
    text = text.replace('{action}', '<strong>Action:</strong>');
    text = text.replace('{focused}', '<strong>focused</strong>');
    text = text.replace('{dazed}', '<strong>dazed</strong>');
    text = text.replace('{fearless}', '<strong>fearless</strong>');
    text = text.replace('{mesmerized}', '<strong>mesmerized</strong>');
    text = text.replace('{poisoned}', '<strong>poisoned</strong>');
    text = text.replace('{restrained}', '<strong>restrained</strong>');
    text = text.replace('{righteous}', '<strong>righteous</strong>');
    text = text.replace('{stressed}', '<strong>stressed</strong>');
    text = text.replace('{stunned}', '<strong>stunned</strong>');
    text = text.replace('{wounded}', '<strong>wounded</strong>');
    text = text.replace('{insane}', '<strong>insane</strong>');
    text = text.replace('{strength}', '<span class="strength"></span>');
    text = text.replace('{agility}', '<span class="agility"></span>');
    text = text.replace('{observation}', '<span class="observation"></span>');
    text = text.replace('{lore}', '<span class="lore"></span>');
    text = text.replace('{influence}', '<span class="influence"></span>');
    text = text.replace('{will}', '<span class="will"></span>');
    text = text.replace('{?}', '<span class="investigation"></span>');
    text = text.replace('{success}', '<span class="success"></span>');
    return text;
  },

  Format: function(text) {
    text = text.replace('\n\n', '<br /><br />');
    text = text.replace('{', '<i>&quot;');
    text = text.replace('}', '&quot;</i>');
    text = text.replace('[', '<strong>');
    text = text.replace(']', '</strong>');
    return text;
  },

  Clean: function(url) {
    if (url.indexOf('dropbox.com') > -1) {
      url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      url = url.replace('?dl=0', '?raw=1');
    }
    return url;
  }

};
