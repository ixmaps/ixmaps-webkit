/* jslint node: true */
/* global document,$,window */
'use strict';

var traceLib = window.traceLib;
var requests = require('./lib/requests');

var TRSETS_BASE = 'http://ixmaps.ca/trsets/';

// currently processign items
var processing = {}, completed = {}, freeze = false;

$(document).ready(function() {

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

  // kick off the queue
  requests.processQueue();

  // add copy/paste for MacOS
  var gui = require('nw.gui');
  var win = gui.Window.get();
  var nativeMenuBar = new gui.Menu({ type: "menubar" });

  try {
    nativeMenuBar.createMacBuiltin("My App");
    win.menu = nativeMenuBar;
  } catch (ex) {
    console.log(ex.message);
  }

  // # Setup operating environment
  $('#debug').click(function() {
    if (this.checked) {
      require('nw.gui').Window.get().showDevTools();
      requests.setDebug(true);
    } else {
      requests.setDebug(false);
    }
  });

  $('#doSubmit').click(function() {
    requests.setSubmit(this.checked);
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

  $('.viewControl').change(function() {
    showDetails($('#viewport'));
  });

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

  // Retrieve the ixmaps trsets and add them to the select
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

  // # Operating functions

  // provide progress to running traces
  requests.setTraceProgressCB(function(err, update) {
    processing[update.traceID] = update;
    showDetails($('#viewport'));
  });

  requests.setTraceDoneCB(function(err, update) {
    var traceID = update.traceID;
    console.log('done, removing', traceID);
    completed[traceID] = $.extend({}, processing[traceID], update);
    delete processing[traceID];
    showDetails($('#viewport'));
  });

  // general summary of traces
  function showDetails($vp) {
    var state = requests.getState();
    $('#processing').html(Object.keys(state.processingHosts).length);
    $('#queued').html(Object.keys(state.queuedHosts).length);
    $('#processed').html(Object.keys(state.allHops).length);

    if (freeze) {
      return;
    }

    var toshow, t, table = '<table><tr>', tdata = '', c;
    switch ($('#toView').val()) {
      case 'processing':
        toshow = processing;
        break;
      case 'completed':
        toshow = completed;
        break;
      default:
        toshow = $.extend({}, processing, completed);
    }

    $vp.html('');
    for (t in toshow) {
      c = (processing[t] ? 'processing' : 'completed');
      table += '<th class="' + c + '">' +  t + '</th>';
      var update = toshow[t];
      tdata += '<td class="' + c + '">' + (
         $('#traceView').val() === 'details' ?  summarizeUpdate(update)
        : '<pre>' + update.buffer + '</pre>'
      ) + '</td>';
    }
    $vp.append(table + '</tr><tr>' + tdata + '</tr></table>');
  }

  function summarizeUpdate(update) {
    var now = update.now;
    return (now.getMonth() + 1) + '/' + now.getDate() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + '\n' +
      Object.keys(update).map(function(k) { return '<b>' + k + '</b>: ' + JSON.stringify(update[k]); }).join('\n');
  }

  // show options according to config validity
  function resetUI() {
    if (traceLib.valid) {
      $('.needsConfig').show();
    } else {
      $('.needsConfig').hide();
    }
  }

});

// Return the default stored values
function formValues() {
  var data = {};
  traceLib.stored.forEach(function(field) {
    data[field] = $('#' + field).val() || '';
  });
  return data;
}
