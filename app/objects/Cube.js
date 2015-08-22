'use strict';

import THREE from 'three';

export default class Cube extends THREE.Object3D {
  constructor() {
    super();

    this.length = 100;
    this.width = 1;

    var j = 0, 
        k = 0;

    for (var i = 0; i < this.length; i++) {
      this['geom' + i] = new THREE.BoxGeometry(25, 50, 10);
      this['mat' + i] = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff
      });
      this['geom' + i].applyMatrix(new THREE.Matrix4().makeTranslation(0, 25, 0));

      this['mesh' + i] = new THREE.Mesh(this['geom' + i], this['mat' + i]);

      this['mesh' + i].position.x = j*30;
      this['mesh' + i].position.z = k*15;

      this.add(this['mesh' + i]);

      j++

      if (j == 5){
        j = 0;
        k++;
      }
    };
  }

  update(bytes) {
    for (var i = 0; i < 100; i++) {
      this['mesh' + i].scale.setY(bytes[i]*0.005);
    };
  }
}