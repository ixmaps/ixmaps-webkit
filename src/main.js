/* jslint node: true */
/* global document,$,window */
'use strict';

var traceLib = window.traceLib;
var requests = require('./lib/requests');

var TRSETS_BASE = 'http://ixmaps.ca/trsets/';

// currently processign items
var processing = {}, freeze = false;

$(document).ready(function() {
  $('#debug').click(function() {
    if (this.checked) {
      require('nw.gui').Window.get().showDevTools();
      requests.setDebug(true);
    } else {
      requests.setDebug(false);
    }
  });

  $('#nparallel').change(function() {
    requests.setParallel($(this).val());
  });

  $('#freeze').click(function() {
    freeze = this.checked;
    if (freeze) {
      $('#viewport').addClass('frozen');
    } else {
      $('#viewport').removeClass('frozen');
    }
    showDetails($('#viewport'));
  });

  // provide progress to running traces
  requests.setTraceProgressCB(function(err, update) {
    processing[update.traceID] = update;
    showDetails($('#viewport'));
  });

  requests.setTraceDoneCB(function(err, update) {
    console.log('done, removing', update.traceID);
    delete processing[update.traceID];
    showDetails($('#viewport'));
  });

  function showDetails($vp) {
  var state = requests.getState();
    $('#processing').html(Object.keys(state.processingHosts).length);
    $('#queued').html(Object.keys(state.queuedHosts).length);
    $('#processed').html(Object.keys(state.allHops).length);

    if (freeze) {
      return;
    }

    var t, d;
    $vp.html('');
    for (t in processing) {
      var update = processing[t], now = update.now;
      d = '\n' + (now.getMonth() + 1) + '/' + now.getDate() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + '\n' + Object.keys(update).map(function(k) { return k + ': ' + JSON.stringify(update[k]); }).join('\n');
      $vp.append('<div class="debugItem">' + d.replace(/\\n/g, '\n<br />')+ '</div>');
    }
  }

  // retrieve the ixmaps trsets and add them to the select
  $.get(TRSETS_BASE, function(data) {
    $('#trsets').html(data);
    var links = $('#trsets a');
    // re-populate trset select
    $('#trsets a').each(function(k) {
      var l = $(this).attr('href');
      if (l.match(/.*\.trset$/)) {
        l = l.replace('./', '').replace('.trset', '').replace(/_/g, ' ');
        $('#trset').append($('<option />').text(l));
      }
    });
  });

  // Load initial settings
  var data = formValues();
  console.log('default data', data);
  traceLib.init(data);

  if (traceLib.valid) {
    traceLib.stored.forEach(function(field) {
      $('#' + field).val(data[field]);
    });
  }
  resetUI();

  // show options according to config validity
  function resetUI() {
    if (traceLib.valid) {
      $('.needsConfig').show();
    } else {
      $('.needsConfig').hide();
    }
  }

  // User has selected from a list
  $('.selectHost').on('change', function() {
    if ($(this).val()) {
      $('#trhost').val($(this).val());
    }
  });

  // Bind new settings
  $('#saveConfig').click(function() {
    data = formValues();
    traceLib.init(data);
    resetUI();
  });

  // Submit trset or URL
  $('#traceHost').click(function() {
    var data = formValues();
    data.type = 'submitted';
    data.data = $('#trhost').val();
    data.tag = $('#tag').val();

    requests.processRequests({requests: [data]}, requests.processIncoming);
  });

  // kick off the queue
  requests.processQueue();

});

// Return the default stored values
function formValues() {
  var data = {};
  traceLib.stored.forEach(function(field) {
    data[field] = $('#' + field).val() || '';
  });
  return data;
}
