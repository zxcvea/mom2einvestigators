$(document).ready(function() {
  InvestigatorSheet.Init();
});

var InvestigatorSheet = {

  DEFAULT_WIDTH: 1406,
  DEFAULT_HEIGHT: 815,
  WINDOW_WIDTH: 0,
  WINDOW_HEIGHT: 0,
  INNER_LEFT: 0,
  INVESTIGATOR_INDEX: 0,
  DISPLAY_SETTINGS: false,
  SHOW_STORY: false,
  FULLSCREEN: false,
  DEFAULTSOURCE: 'investigator-presets.js',
  DATASOURCE: 'investigator-presets.js',

  LoadJsScript: function(scriptUrl) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);

    return new Promise((res, rej) => {
      script.onload = function() {
        res();
      }
      script.onerror = function () {
        rej();
      }
    });
  },

  ChangeDatasource: function(setItems){
    $("#datascript").remove();
    InvestigatorSheet.LoadJsScript(InvestigatorSheet.DATASOURCE)
      .then(() => {
        InvestigatorSheet.Refresh();
      });
  },

  Setup: function() {
    var container = '<div id="main"><div id="container"><div id="inner"></div></div></div>';
    $('body').append(container);
    $('#inner').width(investigators.length * $('#container').width());

    var settingsBtn = '<a href="javascript:void(0);" id="btn-settings">&nbsp;</a>';
    var enterfsBtn = '<a href="javascript:void(0);" id="btn-enterfs">&nbsp;</a>';
    var exitfsBtn = '<a href="javascript:void(0);" id="btn-exitfs">&nbsp;</a>';
    $('#container').append(settingsBtn);
    $('#container').append(enterfsBtn);
    $('#container').append(exitfsBtn);

    var settingsCtn = '<div id="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding"><h2>Settings</h2><label>Custom Investigators:</label><p>To use your own custom investigators, paste the location of your custom Investigator data JS file.</p><input type="text" id="datasource" /> <a href="javascript:void(0);" id="btn-update-data" class="btn">Update</a><div class="clear">&nbsp;</div><a href="javascript:void(0);" id="btn-reset-data" class="btn">Reset</a></div></div>';
    $('#container').append(settingsCtn);
    $('#btn-exitfs').hide();
  },

  BuildTemplate: function(investigator) {
    var profile = '<div id="profile-image"><img src="' + investigator.Image + '" /></div><div id="profile-name" class="noselect">' + investigator.Name + '</div><div id="profile-job" class="noselect">' + investigator.Job + '</div>';
    var ability = '<div id="ability" class="noselect">' + Dictionary.Replace(investigator.Ability) + '</div>';
    var stats = '<div id="stats"><div id="stats-damage" class="stat-' + investigator.Stats.Damage + '"></div><div id="stats-horror" class="stat-' + investigator.Stats.Horror + '"></div></div>';
    var attributes = '<div id="attributes"><div id="attributes-strength" class="attribute-' + investigator.Attributes.Strength + '"></div><div id="attributes-agility" class="attribute-' + investigator.Attributes.Agility + '"></div><div id="attributes-observation" class="attribute-' + investigator.Attributes.Observation + '"></div><div id="attributes-lore" class="attribute-' + investigator.Attributes.Lore + '"></div><div id="attributes-influence" class="attribute-' + investigator.Attributes.Influence + '"></div><div id="attributes-will" class="attribute-' + investigator.Attributes.Will + '"></div></div>';
    var story = '<div id="story">' + Dictionary.Format(investigator.Story) + '</div>';

    var template = '<div class="template"><div class="inner"><div class="front">' + profile + ability + stats + attributes + '</div><div class="back">' + story + '</div></div></div>';
    $('#inner').append(template);
  },

  CreateInvestigators: function() {
    jQuery.each(investigators, function(index, investigator) {
      InvestigatorSheet.BuildTemplate(investigator);
    });
  },

  Refresh: function() {
    $('.template').remove();
    InvestigatorSheet.CreateInvestigators();
  },

  Navigate: function(direction) {
    if (direction == 'right' && InvestigatorSheet.INVESTIGATOR_INDEX == (investigators.length - 1)) {
      return;
    }

    if (direction == 'left' && InvestigatorSheet.INVESTIGATOR_INDEX == 0) {
      return;
    }

    InvestigatorSheet.INVESTIGATOR_INDEX = (direction == 'right') ? InvestigatorSheet.INVESTIGATOR_INDEX + 1 : InvestigatorSheet.INVESTIGATOR_INDEX - 1;
    leftPos = InvestigatorSheet.INNER_LEFT;
    if (direction == 'right') {
      movePos = leftPos - $('#container').width();
    } else {
      movePos = leftPos + $('#container').width();
    }
    InvestigatorSheet.INNER_LEFT = movePos;
    $('#inner').animate({
      left: movePos + 'px'
    }, 300, function() {
      $('.template .inner').css('top', '0');
      InvestigatorSheet.SHOW_STORY = false;
    });
  },

  ShowStory: function(direction) {
    if (direction == 'up' && !InvestigatorSheet.SHOW_STORY) {
      InvestigatorSheet.SHOW_STORY = true;
      var movePos = $('#container').height();
      $('.inner:eq(' + InvestigatorSheet.INVESTIGATOR_INDEX + ')').animate({
        top: -movePos + 'px'
      }, 300);
    } else if (direction == 'down' && InvestigatorSheet.SHOW_STORY) {
      InvestigatorSheet.SHOW_STORY = false;
      $('.inner:eq(' + InvestigatorSheet.INVESTIGATOR_INDEX + ')').animate({
        top: '0'
      }, 300);
    }
  },

  Scale: function() {
    var scale, origin;

    var lr = InvestigatorSheet.DEFAULT_WIDTH / InvestigatorSheet.DEFAULT_HEIGHT;
    var pr = InvestigatorSheet.DEFAULT_HEIGHT / InvestigatorSheet.DEFAULT_WIDTH;
    var wr = $(window).width() / $(window).height();
    if (wr >= 1) {
      // landscape
      if ($(window).width() >= InvestigatorSheet.DEFAULT_WIDTH && $(window).height() >= InvestigatorSheet.DEFAULT_HEIGHT) {
        scale = 1;
      } else if (wr >= lr) {
        scale = $(window).height() / InvestigatorSheet.DEFAULT_HEIGHT;
      } else {
        scale = $(window).width() / InvestigatorSheet.DEFAULT_WIDTH;
      }
    } else {
      // portrait
      if ($(window).height() >= InvestigatorSheet.DEFAULT_WIDTH && $(window).width() >= InvestigatorSheet.DEFAULT_HEIGHT) {
        scale = 1;
      } else if (wr <= pr) {
        scale = $(window).width() / InvestigatorSheet.DEFAULT_HEIGHT;
      } else {
        scale = $(window).height() / InvestigatorSheet.DEFAULT_WIDTH;
      }
    }

    $('#container').css({
      transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
    });

    $('#inner').width(investigators.length * $('#container').width());
  },

  Events: function() {
    var hitArea = document.getElementById('container');
    var hammer = new Hammer(hitArea);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("swipeleft", function(ev) {
      if (!InvestigatorSheet.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio >= 1) {
          InvestigatorSheet.Navigate('right');
        } else {
          InvestigatorSheet.ShowStory('down');
        }
      }
    });
    hammer.on("swiperight", function(ev) {
      console.log(0);
      if (!InvestigatorSheet.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio >= 1) {
          InvestigatorSheet.Navigate('left');
        } else {
          InvestigatorSheet.ShowStory('up');
        }
      }
    });
    hammer.on("swipeup", function(ev) {
      if (!InvestigatorSheet.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio < 1) {
          InvestigatorSheet.Navigate('right');
        } else {
          InvestigatorSheet.ShowStory('up');
        }
      }
    });
    hammer.on("swipedown", function(ev) {
      if (!InvestigatorSheet.DISPLAY_SETTINGS) {
        var ratio = $(window).width() / $(window).height();
        if (ratio < 1) {
          InvestigatorSheet.Navigate('left');
        } else {
          InvestigatorSheet.ShowStory('down');
        }
      }
    });

    $(document).click(function() {
      if ($('#container').width() != InvestigatorSheet.WINDOW_WIDTH || $('#container').height() != InvestigatorSheet.WINDOW_HEIGHT) {
        InvestigatorSheet.Scale();
      }
    });

    $(document).on('click', '#btn-enterfs', function(){
      InvestigatorSheet.ToggleFullscreen();
    });

    $(document).on('click', '#btn-exitfs', function(){
      InvestigatorSheet.ToggleFullscreen();
    });

    $(document).on('click', '#btn-settings', function(){
      if (!InvestigatorSheet.DISPLAY_SETTINGS) {
        $('#settings').animate({
          top: '0'
        }, 300, function() {
          InvestigatorSheet.DISPLAY_SETTINGS = true;
        });
        $('#btn-exitfs, #btn-enterfs, #btn-settings').hide();
      }
    });

    $(document).on('click', '#btn-exit-settings', function(){
      if (InvestigatorSheet.DISPLAY_SETTINGS) {
        var movePos = $('#container').height();
        $('#settings').animate({
          top: -movePos + 'px'
        }, 300, function() {
          InvestigatorSheet.DISPLAY_SETTINGS = false;
        });
        if (InvestigatorSheet.FULLSCREEN) {
          $('#btn-enterfs').hide();
          $('#btn-exitfs, #btn-settings').show();
        } else {
          $('#btn-enterfs, #btn-settings').show();
          $('#btn-exitfs').hide();
        }
      }
    });

    $(document).on('click', '#btn-update-data', function(){
      var datasource = $('#datasource').val();
      InvestigatorSheet.DATASOURCE = datasource;
      InvestigatorSheet.ChangeDatasource();
    });

    $(document).on('click', '#btn-reset-data', function(){
      $('#datasource').val('');
      InvestigatorSheet.DATASOURCE = InvestigatorSheet.DEFAULTSOURCE;
      InvestigatorSheet.ChangeDatasource();
    });
  },

  ToggleFullscreen: function() {
    if (!InvestigatorSheet.FULLSCREEN) {
      InvestigatorSheet.FULLSCREEN = true;
      document.documentElement.requestFullscreen();
      $('#btn-enterfs').hide();
      $('#btn-exitfs').show();
    } else {
      InvestigatorSheet.FULLSCREEN = false;
      document.exitFullscreen();
      $('#btn-enterfs').show();
      $('#btn-exitfs').hide();
    }
  },

  Init: function() {
    InvestigatorSheet.Setup();
    InvestigatorSheet.CreateInvestigators();
    InvestigatorSheet.Events();
    InvestigatorSheet.Scale();
  }

};

var Dictionary = {

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
  }

};
