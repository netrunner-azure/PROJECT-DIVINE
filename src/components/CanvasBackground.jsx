// src/components/CanvasBackground.jsx
import { onCleanup, onMount } from 'solid-js';
import * as THREE from 'three';

export default function CanvasBackground(props) {
  let canvas;

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://res.cloudinary.com/dut9zvx7x/image/upload/v1746345950/cosmic_wrtqjc.png',
      (texture) => {
        const geometry = new THREE.PlaneGeometry(40, 40);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            u_time: { value: 0 },
            u_texture: { value: texture }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float u_time;
            uniform sampler2D u_texture;
            varying vec2 vUv;

            void main() {
              vec2 uv = vUv;
              uv.y += 0.01 * sin(uv.x * 10.0 + u_time * 0.8);
              uv.x += 0.01 * cos(uv.y * 10.0 + u_time * 0.8);
              vec4 texColor = texture2D(u_texture, uv);
              gl_FragColor = texColor;
            }
          `,
          transparent: true,
          side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        plane.position.z = -5;
        camera.position.z = 5;

        function animate() {
          material.uniforms.u_time.value += 0.01;
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        }
        animate();
      }
    );

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
    });
  });

  return <canvas id="bg" class={props.class} ref={el => (canvas = el)} />;
}