'use strict';

import Cube from './objects/Cube';
import THREE from 'three';
window.THREE = THREE;

export default class Webgl {
  constructor(width, height) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 300;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x0);

    this.usePostprocessing = true;
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(width, height);
    this.initPostprocessing();

    this.cube = new Cube();
    this.cube.position.set(-50, 0, 0);
    this.scene.add(this.cube);

    // Controls
    this.mouseX = 0;
    this.mouseY = 0;

    // Audio
    this.ctx = new AudioContext();
    this.audio = document.getElementById('myAudio');
    this.audioSrc = this.ctx.createMediaElementSource(this.audio);
    this.analyser = this.ctx.createAnalyser();
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.averagesArray = [];
    this.audioData = [];

    this.init();
  }

  init(){
    // we have to connect the MediaElementSource with the analyser 
    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.ctx.destination);

    this.audio.play();
  };

  initPostprocessing() {
    if (!this.usePostprocessing) return;

    this.vignette2Pass = new WAGNER.Vignette2Pass();
  };

  resize(width, height) {
    this.composer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  mousemove(x, y){
    this.mouseX = x;
    this.mouseY = y;
  }

  splitFrenquencyArray(arr, n){
    var tab = Object.keys(arr).map(function (key) {return arr[key]});
    var len = tab.length,
      result = [],
      i = 0;

    while (i < len) {
      var size = Math.ceil((len - i) / n--);
      result.push(tab.slice(i, i + size));
      i += size;
    }

    return result;
  };

  render() {
    if (this.usePostprocessing) {
      this.composer.reset();
      this.composer.renderer.clear();
      this.composer.render(this.scene, this.camera);
      this.composer.pass(this.vignette2Pass);
      this.composer.toScreen();
    } else {
      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
    //console.log(this.mouseX);

    this.camera.position.x += 1.2;

    this.camera.position.x += ( this.mouseX - this.camera.position.x ) * 0.05;
    this.camera.position.y += ( - this.mouseY - this.camera.position.y ) * 0.05;


    this.camera.lookAt( this.scene.position );

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.averagesArray = this.splitFrenquencyArray(this.frequencyData, 100);

    // Make average of frenquency array entries
    for(var i = 0; i < this.averagesArray.length - 10; i++) {
      var average = 0;

      for(var j = 0; j < this.averagesArray[i].length; j++) {
        average += this.averagesArray[i][j];
      }
      this.audioData[i] = average/this.averagesArray[i].length;
    }

    this.cube.update(this.audioData);
    //this.camera.position.z += -1;
  }
}