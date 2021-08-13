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
  FULLSCREEN: false,

  Setup: function() {
    var container = '<div id="main"><div id="container"><div id="inner"></div></div></div>';
    $('body').append(container);
    $('#inner').width(investigators.length * $('#container').width());

    var enterfsBtn = '<a href="javascript:void();" id="btn-enterfs"><svg viewbox="0 0 40 40"><path class="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" /></svg></a>';
    var exitfsBtn = '<a href="javascript:void();" id="btn-exitfs"><svg viewbox="0 0 40 40"><path class="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" /></svg></a>';
    $('#container').append(enterfsBtn);
    $('#container').append(exitfsBtn);
    $('#btn-exitfs').hide();
  },

  BuildTemplate: function(investigator) {
    var profile = '<div id="profile-image"><img src="' + investigator.Image + '" /></div><div id="profile-name" class="noselect">' + investigator.Name + '</div><div id="profile-job" class="noselect">' + investigator.Job + '</div>';
    var ability = '<div id="ability" class="noselect">' + Dictionary.Replace(investigator.Ability) + '</div>';
    var stats = '<div id="stats"><div id="stats-damage" class="stat-' + investigator.Stats.Damage + '"></div><div id="stats-horror" class="stat-' + investigator.Stats.Horror + '"></div></div>';
    var attributes = '<div id="attributes"><div id="attributes-strength" class="attribute-' + investigator.Attributes.Strength + '"></div><div id="attributes-agility" class="attribute-' + investigator.Attributes.Agility + '"></div><div id="attributes-observation" class="attribute-' + investigator.Attributes.Observation + '"></div><div id="attributes-lore" class="attribute-' + investigator.Attributes.Lore + '"></div><div id="attributes-influence" class="attribute-' + investigator.Attributes.Influence + '"></div><div id="attributes-will" class="attribute-' + investigator.Attributes.Will + '"></div></div>';

    var template = '<div class="template">' + profile + ability + stats + attributes + '</div>';
    $('#inner').append(template);
  },

  CreateInvestigators: function() {
    jQuery.each(investigators, function(index, investigator) {
      InvestigatorSheet.BuildTemplate(investigator);
    });
  },

  Swipe: function(direction) {
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
    }, 300);
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
    var ratio = $(window).width() / $(window).height();

    var hitArea = document.getElementById('container');
    var hammer = new Hammer(hitArea);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("swipeleft", function(ev) {
      if (ratio >= 1) {
        InvestigatorSheet.Swipe('right');
      } else {

      }
    });
    hammer.on("swiperight", function(ev) {
      if (ratio >= 1) {
        InvestigatorSheet.Swipe('left');
      } else {

      }
    });
    hammer.on("swipeup", function(ev) {
      if (ratio < 1) {
        InvestigatorSheet.Swipe('right');
      } else {

      }
    });
    hammer.on("swipedown", function(ev) {
      if (ratio < 1) {
        InvestigatorSheet.Swipe('left');
      } else {

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
  }

};
