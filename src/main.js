/* jslint node: true */
/* global document,$,window */
'use strict';

var traceLib = window.traceLib;
var requests = require('./lib/requests');

var TRSETS_BASE = 'http://ixmaps.ca/trsets/';

// currently processign items
var processing = {};

$(document).ready(function() {
  // kick off the queue
  requests.processQueue();

  requests.setDebug(true);
  // provide progress to running traces
  requests.setTraceProgressCB(function(err, update) {
    console.log('updating', update.traceID, processing);
    processing[update.traceID] = update;
    showDetails($('#viewport'));
  });

  requests.setTraceDoneCB(function(err, update) {
    console.log('done, removing', update.traceID);
    delete processing[update.traceID];
    showDetails($('#viewport'));
  });

  function showDetails($vp) {
    var t, d;
    $vp.html('');
    for (t in processing) {
      var update = processing[t], now = update.now;
      d = '\n' + (now.getMonth() + 1) + '/' + now.getDate() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + '\n' + Object.keys(update).map(function(k) { return k + ': ' + JSON.stringify(update[k]); }).join('\n');
      $vp.append(d.replace(/\\n/g, '\n<br />'));
      console.log('EEEE', d);
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
  var data = defaultValues();
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
    data = defaultValues();
    traceLib.init(data);
    resetUI();
  });

  // Submit trset or URL
  $('#traceHost').click(function() {
    var data = defaultValues();
    data.type = 'submitted';
    data.data = $('#trhost').val();

    requests.processRequests({requests: [data]}, function(err, res) {
       $('#viewport').append(new Date() + ' ' + res);
      requests.processIncoming(err, res);
    });
  });

});

// Return the default stored values
function defaultValues() {
  var data = {};
  traceLib.stored.forEach(function(field) {
    data[field] = $('#' + field).val() || '';
  });
  return data;
}
