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
      // create geometry and material
      this['geom' + i] = new THREE.BoxGeometry(25, 50, 10);
      this['mat' + i] = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff
      });

      // change geometry's origin
      this['geom' + i].applyMatrix(new THREE.Matrix4().makeTranslation(0, 25, 0));

      // create mesh
      this['mesh' + i] = new THREE.Mesh(this['geom' + i], this['mat' + i]);

      // set position of the mesh
      this['mesh' + i].position.x = j*30;
      this['mesh' + i].position.z = k*15;

      // add mesh to the scene
      this.add(this['mesh' + i]);

      j++

      if (j == 5){ // if there are 5 boxes on the line, we go to the next line
        j = 0;
        k++;
      }
    };
  }

  update(bytes) { // update height of boxes
    for (var i = 0; i < 100; i++) {
      if (bytes[i] > 0) {
        this['mesh' + i].scale.setY(bytes[i]*0.005);
      } else {
        this['mesh' + i].scale.setY(0.0000001);
      }
    };
  }
}