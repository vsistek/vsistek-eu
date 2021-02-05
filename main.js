/*
 * Copyright 2010, Google Inc.
 * Copyright 2021, Vaclav Sistek
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

tdl.require('tdl.fast');
tdl.require('tdl.math');
tdl.require('tdl.primitives');
tdl.require('tdl.shader');
tdl.require('tdl.programs');
tdl.require('tdl.log');
tdl.require('tdl.models');
tdl.require('tdl.buffers');
tdl.require('tdl.framebuffers');
tdl.require('tdl.textures');
tdl.require('tdl.webgl');

var gl;
var canvas;
var aspect;

// Use this to refer to the backbuffer as if it were another framebuffer
var backbuffer;
var post;
var quad;
var g_requestId;

var g_hueMin = 0.7;
var g_hueMax = 1;
var g_hue = g_hueMax;
var g_sat = 1;
var g_add = 1;
var g_step = 0.0005;

if (!window.Float32Array) {
  // This just makes some errors go away when there is no WebGL.
  window.Float32Array = function() { };
}

var up = new Float32Array([0, 1, 0])
var output = alert

function mainloop() {
  // Repeatedly run render(), attempt to hold 60 but the demo is
  // framerate independent so we will still keep sync even if we
  // lose frames.
  var bootTime = (new Date()).getTime();
  var singleEffect = new FlowerEffect();
  function render() {
    //var now = ((new Date()).getTime() - bootTime) * 0.0001;
    var now = ((new Date()).getTime() - bootTime) * 0.0001;
    aspect = canvas.clientWidth / canvas.clientHeight
    var framebuffer = backbuffer;

    g_hue += g_step;

    if (g_hue < g_hueMin) {
      g_hue = g_hueMin;
      g_step = -(g_step);
    } else if (g_hue > g_hueMax) {
      g_hue = g_hueMax;
      g_step = -(g_step);
    }

    singleEffect.render(framebuffer, now, g_hue, g_sat)
    g_requestId = requestAnimationFrame(render);
  }
  render();
}

function initializeGraphics() {
  aspect = canvas.clientWidth / canvas.clientHeight
  quad = new QuadDrawer()
  backbuffer = tdl.framebuffers.getBackBuffer(canvas)
  post = new PostProcessor(canvas.width, canvas.height)

  // Set some sane defaults.
  gl.disable(gl.BLEND);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return true;
}

function setup() {
  if (initializeGraphics()) {
    mainloop()
  }
}

window.onload = function() {
  canvas = document.getElementById('render_area');

  tdl.webgl.registerContextLostHandler(canvas, handleContextLost);
  tdl.webgl.registerContextRestoredHandler(canvas, handleContextRestored);

  canvas = document.getElementById('render_area');
  gl = tdl.webgl.setupWebGL(canvas);
  if (!gl) {
    return false;
  }

  setup();
}

function handleContextLost() {
  cancelAnimationFrame(g_requestId);
}

function handleContextRestored() {
  setup();
}