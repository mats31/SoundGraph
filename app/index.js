'use strict';

import domready from 'domready';
import Webgl from './Webgl';
import raf from 'raf';
import dat from 'dat-gui';
import 'gsap';

let webgl;
let gui;
let stats;

domready(() => {
  // webgl settings
  webgl = new Webgl(window.innerWidth, window.innerHeight);
  document.getElementById('webgl').appendChild(webgl.renderer.domElement);

  // Stats Settings
  stats = new Stats();
  stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
  // align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );

  // GUI settings
  gui = new dat.GUI();
  gui.add(webgl, 'usePostprocessing');

  // handle resize
  window.onresize = resizeHandler;
  document.addEventListener( 'mousemove', mousemoveHandler, false );

  // let's play !
  animate();
});

function mousemoveHandler(event){
  webgl.mousemove(event.clientX - window.innerWidth / 2, event.clientY -  window.innerHeight / 2);
}

function resizeHandler() {
  webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
  stats.begin();
  raf(animate);
  webgl.render();
  stats.end();
}