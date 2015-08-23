'use strict';

import Cube from './objects/Cube';
import THREE from 'three';
window.THREE = THREE;

export default class Webgl {
  constructor(width, height) {
    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 300;

    // render
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x0);

    // wagner
    this.usePostprocessing = true;
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(width, height);
    this.initPostprocessing();

    // add Object3D
    this.cube = new Cube();
    this.cube.position.set(-50, 0, 0);
    this.scene.add(this.cube);

    // mouse positions
    this.mouseX = 0;
    this.mouseY = 0;

    // Audio
    this.enableMusic = true;
    this.ctx = new AudioContext();
    this.audio = document.getElementById('myAudio');
    this.audioSrc = this.ctx.createMediaElementSource(this.audio);
    this.analyser = this.ctx.createAnalyser();
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.averagesArray = [];
    this.audioData = [],
    this.length = 100;

    // init
    this.init();
  }

  init(){
    // we have to connect the MediaElementSource with the analyser and the audio context
    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.ctx.destination);

    // play the music !
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

  splitFrenquencyArray(arr, n){ // Split the array of frequencies into several arrays
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
    
    // play/pause the music
    if (this.enableMusic) {
      this.audio.play();
    } else {
      this.audio.pause();
    }

    // move the camera in relation to the mouse position
    this.camera.position.x += ( this.mouseX - this.camera.position.x ) * 0.05;
    this.camera.position.y += ( - this.mouseY - this.camera.position.y ) * 0.05;

    // set the target of the camera on the scene origin
    this.camera.lookAt( this.scene.position );

    // get frequencies
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.audioData = this.splitFrenquencyArray(this.frequencyData, this.length);

    // make an average for each array of frequencies
    for(var i = 0; i < this.audioData.length - 10; i++) {
      var average = 0;

      for(var j = 0; j < this.audioData[i].length; j++) {
        average += this.audioData[i][j];
      }
      this.averagesArray[i] = average/this.audioData[i].length;
    }

    // update the boxes geometries scale
    this.cube.update(this.averagesArray);
  }
}