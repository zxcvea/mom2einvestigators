$(document).ready(function() {
  App.Run();
});

var Investigators;

var Settings = {
  DEFAULTSOURCE: 'investigators-default.json',
  CUSTOMSOURCE: 'investigators-custom.json',
  DATASOURCE: 'investigators-default.json',
  RESET: false,
  STARTUP: true,
  REFRESH: false,
  MODE: 0,
  FULLSCREEN: false
};

var App = {

  LoadDatasource: function(url) {
    url = Data.Clean(url);
    console.log(url);
    $.ajax({
      dataType: "json",
      url: url,
      async: false,
      success: function(data) {
        if (!!data.Investigators) {
          Investigators = data.Investigators;
        } else {
          Investigators = data;
        }
        if (Settings.STARTUP) {
          Template.Init();
          Settings.STARTUP = false;
        } else {
          Template.Refresh();
          if (Settings.DATASOURCE != Settings.CUSTOMSOURCE && !Settings.RESET) {
            $('#data-message').removeClass('error');
            $('#data-message').text('Datasource updated. Using custom Investigators.');
          } else if (Settings.RESET && !Settings.REFRESH) {
            $('#data-message').removeClass('error');
            $('#data-message').text('Using Default Investigators.');
          }
        }
      },
      error: function() {
        $('#data-message').addClass('error');
        $('#data-message').text('Could not get data.');
      }
    });
  },

  ToggleFullscreen: function() {
    if (!Settings.FULLSCREEN) {
      Settings.FULLSCREEN = true;
      document.documentElement.requestFullscreen();
      $('.btn-enterfs').hide();
      $('.btn-exitfs').show();
    } else {
      Settings.FULLSCREEN = false;
      document.exitFullscreen();
      $('.btn-enterfs').show();
      $('.btn-exitfs').hide();
    }
  },

  Run: function() {
    Interface.Build();
  }

};

var Interface = {

  DEFAULT_WIDTH: 1406,
  DEFAULT_HEIGHT: 815,
  WINDOW_WIDTH: 0,
  WINDOW_HEIGHT: 0,

  CreateContainer: function() {
    var container = '<div id="main"><div id="container"><div id="inner"></div></div></div>';
    $('body').append(container);
  },

  CreateStartpage: function() {
    //var startPage = '<div id="home"><div class="title"><h1>Investigator Cards</h1><span>For Mansions of Madness: 2nd Edition</span></div><div class="padding"><a href="javascript:void(0);" id="btn-standard" dataref="0"><span class="icon"></span><span class="text">STANDARD</span></a><a href="javascript:void(0);" id="btn-custom" dataref="2"><span class="icon"></span><span class="text">CUSTOM</span></a></div></div>';
    var startPage = '<div id="home"><div class="padding"><a href="javascript:void(0);" id="btn-standard" class="cta noselect" dataref="0"></a><a href="javascript:void(0);" id="btn-custom" class="cta noselect" dataref="2"></a></div></div>';
    $('#main').append(startPage);
    Interface.Scale();
  },

  CreateButtons: function() {
    var homeBtn = '<a href="javascript:void(0);" id="btn-home">&nbsp;</a>';
    var settingsBtn = '<a href="javascript:void(0);" id="btn-settings">&nbsp;</a>';
    var infoBtn = '<a href="info/" id="btn-info">&nbsp;</a>';
    var enterfsBtn = '<a href="javascript:void(0);" class="btn-enterfs">&nbsp;</a>';
    var exitfsBtn = '<a href="javascript:void(0);" class="btn-exitfs">&nbsp;</a>';
    $('#container').append(homeBtn);
    $('#container').append(settingsBtn);
    $('#home').append(infoBtn);
    $('#container, #home').append(enterfsBtn);
    $('#container, #home').append(exitfsBtn);
    $('.btn-exitfs').hide();
  },

  Scale: function() {
    var scale, origin;

    var lr = Interface.DEFAULT_WIDTH / Interface.DEFAULT_HEIGHT;
    var pr = Interface.DEFAULT_HEIGHT / Interface.DEFAULT_WIDTH;
    var wr = $(window).width() / $(window).height();
    if (wr >= 1) {
      // landscape
      if ($(window).width() >= Interface.DEFAULT_WIDTH && $(window).height() >= Interface.DEFAULT_HEIGHT) {
        scale = 1;
      } else if (wr >= lr) {
        scale = $(window).height() / Interface.DEFAULT_HEIGHT;
      } else {
        scale = $(window).width() / Interface.DEFAULT_WIDTH;
      }
    } else {
      // portrait
      if ($(window).height() >= Interface.DEFAULT_WIDTH && $(window).width() >= Interface.DEFAULT_HEIGHT) {
        scale = 1;
      } else if (wr <= pr) {
        scale = $(window).width() / Interface.DEFAULT_HEIGHT;
      } else {
        scale = $(window).height() / Interface.DEFAULT_WIDTH;
      }
    }

    $('#home, #container, .settings').css({
      transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
    });

    $('#inner').width(($('.template:visible').length * $('#container').width()) + 1);
  },

  Events: function() {
    $(document).click(function() {
      if ($('#container').width() != Interface.WINDOW_WIDTH || $('#container').height() != Interface.WINDOW_HEIGHT) {
        Interface.Scale();
      }
    });

    $(document).on('click', '#btn-standard', function(){
      $('#home').hide();
      Settings.MODE = 0;
      Settings.REFRESH = true;
      Settings.DATASOURCE = Settings.DEFAULTSOURCE;
      App.LoadDatasource(Settings.DATASOURCE);
    });

    $(document).on('click', '#btn-custom', function(){
      $('#home').hide();
      Settings.MODE = 2;
      Settings.REFRESH = true;
      Settings.DATASOURCE = Settings.CUSTOMSOURCE;
      App.LoadDatasource(Settings.DATASOURCE);
    });

    $(document).on('click', '.btn-enterfs', function(){
      App.ToggleFullscreen();
    });

    $(document).on('click', '.btn-exitfs', function(){
      App.ToggleFullscreen();
    });
  },

  Build: function() {
    Interface.CreateContainer();
    Interface.CreateStartpage();
    Interface.CreateButtons();
    Interface.Events();
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

  CreateSettings: function() {
    var settingsCtn = '';
    if (Settings.MODE == 0) {
      settingsCtn = '<div id="settings-default" class="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding" id="filter"><h2>Filter by Expansion</h2><ul><li><a href="javascript:void(0);" class="base" dataref="base"><span class="icon"></span><span class="text">Core</span></a></li><li><a href="javascript:void(0);" class="btt" dataref="btt"><span class="icon"></span><span class="text">Beyond the Threshold</span></a></li><li><a href="javascript:void(0);" class="soa" dataref="soa"><span class="icon"></span><span class="text">Streets of Arkham</span></a></li><li><a href="javascript:void(0);" class="sot" dataref="sot"><span class="icon"></span><span class="text">Sanctum of Twilight</span></a></li><li><a href="javascript:void(0);" class="hj" dataref="hj"><span class="icon"></span><span class="text">Horrific Journeys</span></a></li><li><a href="javascript:void(0);" class="pots" dataref="pots"><span class="icon"></span><span class="text">Path of the Serpent</span></a></li><li><a href="javascript:void(0);" class="rm" dataref="rm"><span class="icon"></span><span class="text">Recurring Nightmares</span></a></li><li><a href="javascript:void(0);" class="smfa" dataref="smfa"><span class="icon"></span><span class="text">Forbidden Alchemy</span></a></li><li><a href="javascript:void(0);" class="smcotw" dataref="smcotw"><span class="icon"></span><span class="text">Call of the Wild</span></a></li></ul></div></div>';
      $('#main').append(settingsCtn);
    } else {
      settingsCtn = '<div id="settings-custom" class="settings"><a href="javascript:void(0);" id="btn-exit-settings">&nbsp;</a><div class="padding"><h2>Settings</h2><label>Custom Investigators:</label><p>To use your own custom investigators, paste the url of your data JS file. <a href="info/">Find out more</a>.</p><p><span id="data-message"></span></p><div class="input-ctn"><input type="text" id="datasource" /></div><a href="javascript:void(0);" id="btn-update-data" class="btn">Update</a><a href="javascript:void(0);" id="btn-reset-data" class="btn">Reset</a></div></div>';
      $('body').append(settingsCtn);
    }

    $('.btn-exitfs, .settings').hide();
    $('#filter ul li a:not(.base)').addClass('inactive');
    $('#filter ul li a.base').addClass('active');
    Settings.REFRESH = false;
  },

  BuildTemplate: function(investigator) {
    var profile = '<div id="profile-image"><img src="' + investigator.Image + '" /></div><div id="profile-name" class="noselect">' + investigator.Name + '</div><div id="profile-job" class="noselect">' + investigator.Job + '</div>';
    var ability = '<div id="ability" class="noselect">' + Data.Replace(investigator.Ability) + '</div>';
    var stats = '<div id="stats"><div id="stats-damage" class="stat-' + investigator.Stats.Damage + '"></div><div id="stats-horror" class="stat-' + investigator.Stats.Horror + '"></div></div>';
    var attributes = '<div id="attributes"><div id="attributes-strength" class="attribute-' + investigator.Attributes.Strength + '"></div><div id="attributes-agility" class="attribute-' + investigator.Attributes.Agility + '"></div><div id="attributes-observation" class="attribute-' + investigator.Attributes.Observation + '"></div><div id="attributes-lore" class="attribute-' + investigator.Attributes.Lore + '"></div><div id="attributes-influence" class="attribute-' + investigator.Attributes.Influence + '"></div><div id="attributes-will" class="attribute-' + investigator.Attributes.Will + '"></div></div>';
    var story = '<div id="story">' + Data.Format(investigator.Story) + '</div>';
    var seticon = '';
    var dataref = 'custom';
    if (investigator.hasOwnProperty('Set')) {
      seticon = '<div class="set-icon ' + investigator.Set + '"></div>';
      dataref = investigator.Set;
    }

    var template = '<div class="template" dataref="' + dataref + '"><div class="inner"><div class="front">' + profile + ability + stats + attributes + seticon + '</div><div class="back">' + story + '</div></div></div>';
    $('#inner').append(template);
  },

  CreateInvestigators: function() {
    jQuery.each(Investigators, function(index, investigator) {
      Template.BuildTemplate(investigator);
    });

    if (Settings.MODE == 0 || Settings.MODE == 0) {
      $('.template:not([dataref="base"])').hide();
    }
  },

  ToggleInvestigators: function(set, show) {
    if (show) {
      $('.template[dataref="' + set + '"]').show();
    } else {
      $('.template[dataref="' + set + '"]').hide();
    }
    Template.UpdateInnerContainer();
  },

  Refresh: function() {
    $('.template').remove();
    $('#inner').css('left', 0);
    Template.INNER_LEFT = 0;
    Template.CreateInvestigators();
    Template.INVESTIGATOR_INDEX = 0;
    if (Settings.REFRESH) {
      $('.settings').remove();
      Template.CreateSettings();
    }
  },

  UpdateInnerContainer: function() {
    $('#inner').css('left', 0);
    $('#inner').width(($('.template:visible').length * $('#container').width()) + 1);
    Template.INNER_LEFT = 0;
    Template.INVESTIGATOR_INDEX = 0;
  },

  Navigate: function(direction) {
    if (direction == 'right' && Template.INVESTIGATOR_INDEX == ($('.template:visible').length - 1)) {
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
      $('.template:visible:eq(' + Template.INVESTIGATOR_INDEX + ') .inner').animate({
        top: -movePos + 'px'
      }, 300);
    } else if (direction == 'down' && Template.SHOW_STORY) {
      Template.SHOW_STORY = false;
      $('.template:visible:eq(' + Template.INVESTIGATOR_INDEX + ') .inner').animate({
        top: '0'
      }, 300);
    }
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

    $(document).on('click', '#btn-home', function(){
      $('#home').show();
    });

    $(document).on('click', '#btn-settings', function(){
      if (!Template.DISPLAY_SETTINGS) {
        var height = $('#container').height();
        $('.settings').show();
        Template.DISPLAY_SETTINGS = true;
        $('.btn-exitfs, .btn-enterfs, #btn-settings').hide();
      }
    });

    $(document).on('click', '#btn-exit-settings', function(){
      if (Template.DISPLAY_SETTINGS) {
        var movePos = $('#container').height();
        $('.settings').hide();
        Template.DISPLAY_SETTINGS = false;
        if (Template.FULLSCREEN) {
          $('.btn-enterfs').hide();
          $('.btn-exitfs, #btn-settings').show();
        } else {
          $('.btn-enterfs, #btn-settings').show();
          $('.btn-exitfs').hide();
        }
        $('#data-message').text('');
      }
    });

    $(document).on('click', '#btn-update-data', function(){
      Settings.RESET = false;
      var datasource = $('#datasource').val();
      Settings.DATASOURCE = datasource;
      App.LoadDatasource(Settings.DATASOURCE);
    });

    $(document).on('click', '#btn-reset-data', function(){
      Settings.RESET = true;
      $('#datasource').val('');
      Settings.DATASOURCE = Settings.CUSTOMSOURCE;
      App.LoadDatasource(Settings.DATASOURCE);
    });

    $(document).on('click', '#filter ul li a', function(){
      var dataref = $(this).attr('dataref');
      var show = false;
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).addClass('inactive');
      } else {
        $(this).removeClass('inactive');
        $(this).addClass('active');
        show = true;
      }
      Template.ToggleInvestigators(dataref, show);
    });
  },

  Init: function() {
    Template.CreateSettings();
    Template.CreateInvestigators();
    Template.Events();
    Interface.Scale();
  }

};

var Data = {

  Replace: function (text) {
    text = text.replace(/\\n/g, '<br />');
    text = text.replace(/\{\{/g, '<strong>');
    text = text.replace(/\}\}/g, '</strong>');
    text = text.replace(/\{action\}/g, '<strong>Action:</strong>');
    text = text.replace(/\{focused\}/g, '<strong>focused</strong>');
    text = text.replace(/\{dazed\}/g, '<strong>dazed</strong>');
    text = text.replace(/\{fearless\}/g, '<strong>fearless</strong>');
    text = text.replace(/\{mesmerized\}/g, '<strong>mesmerized</strong>');
    text = text.replace(/\{poisoned\}/g, '<strong>poisoned</strong>');
    text = text.replace(/\{restrained\}/g, '<strong>restrained</strong>');
    text = text.replace(/\{righteous\}/g, '<strong>righteous</strong>');
    text = text.replace(/\{stressed\}/g, '<strong>stressed</strong>');
    text = text.replace(/\{stunned\}/g, '<strong>stunned</strong>');
    text = text.replace(/\{wounded\}/g, '<strong>wounded</strong>');
    text = text.replace(/\{insane\}/g, '<strong>insane</strong>');
    text = text.replace(/\{strength\}/g, '<span class="strength"></span>');
    text = text.replace(/\{agility\}/g, '<span class="agility"></span>');
    text = text.replace(/\{observation\}/g, '<span class="observation"></span>');
    text = text.replace(/\{lore\}/g, '<span class="lore"></span>');
    text = text.replace(/\{influence\}/g, '<span class="influence"></span>');
    text = text.replace(/\{will\}/g, '<span class="will"></span>');
    text = text.replace(/\{\?\}/g, '<span class="investigation"></span>');
    text = text.replace(/\{success\}/g, '<span class="success"></span>');
    return text;
  },

  Format: function(text) {
    text = text.replace('\n\n', '<br /><br />');
    text = text.replace(/\\n/g, '<br />');
    text = text.replace(/\[/g, '<i>&quot;');
    text = text.replace(/\]/g, '&quot;</i>');
    text = text.replace(/\{/g, '<strong>');
    text = text.replace(/\}/g, '</strong>');
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
