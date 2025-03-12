import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.querySelector('.container');
const boxCanvas = document.querySelector('#box-canvas');

// Box parameters and elements
let box = {
    params: {
        width: 60, length: 45, depth: 45, thickness: 1, flapGap: 0.
    },
    els: {
        group: new THREE.Group(),
        backHalf: {
            width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
            length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() }
        },
        frontHalf: {
            width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
            length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() }
        }
    },
    animated: {
        openingAngle: 0,
    }
};

// Globals
let renderer, scene, camera, orbit, lightHolder;

// Run the app
initScene();
window.addEventListener('resize', updateSceneSize);

// --------------------------------------------------
// Initialize Three.js Scene
function initScene() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: boxCanvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 10, 1000);
    camera.position.set(0, 20, 140);

    updateSceneSize();
    scene.add(box.els.group);
    setGeometryHierarchy();

    // Add lights
    addLights();

    // Set material for the box
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x9C8D7B), side: THREE.DoubleSide });
    box.els.group.traverse(c => { if (c.isMesh) c.material = material; });

    const textureLoader = new THREE.TextureLoader();
    const material02 = new THREE.MeshStandardMaterial({
        map: textureLoader.load('./static/img/boxTexture.jpg'),
        side: THREE.DoubleSide
    });
    // 박스의 메쉬에 재질 적용
    box.els.group.traverse(c => {
        if (c.isMesh) {
            c.material = material02;
        }
    });
    // OrbitControls for camera manipulation
    setupOrbitControls();
    createBoxElements();
    updatePanelsTransform();
    render();
}

function addLights() {
    // 주변광 (Ambient Light) 밝기 증가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);  // 기본값은 0.5, 이를 1로 변경
    scene.add(ambientLight);
    lightHolder = new THREE.Group();
    // 포인트 라이트 (Point Light) 강도 증가
    const topLight = new THREE.PointLight(0xffffff, 0.5);  // 기본값은 0.5, 이를 1로 변경
    topLight.position.set(150, 150, 30);
    lightHolder.add(topLight);
    const sideLight = new THREE.PointLight(0xffffff, 0.55);
    sideLight.position.set(50, 0, 150);
    lightHolder.add(sideLight);
    scene.add(lightHolder);
}

function setupOrbitControls() {
    orbit = new OrbitControls(camera, boxCanvas);
    orbit.enableZoom = true;
    orbit.enablePan = true;
    orbit.enableDamping = true;
    orbit.autoRotate = true;
    orbit.autoRotateSpeed = 0.25;
}

function render() {
    orbit.update(); // OrbitControls update
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function updateSceneSize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// --------------------------------------------------
// Set Box Geometry Hierarchy
function setGeometryHierarchy() {
    box.els.group.add(
        box.els.frontHalf.width.side,
        box.els.frontHalf.length.side,
        box.els.backHalf.width.side,
        box.els.backHalf.length.side
    );

    // Add flaps to the sides
    addFlapsToSides();
}

function addFlapsToSides() {
    box.els.frontHalf.width.side.add(box.els.frontHalf.width.top, box.els.frontHalf.width.bottom);
    box.els.frontHalf.length.side.add(box.els.frontHalf.length.top, box.els.frontHalf.length.bottom);
    box.els.backHalf.width.side.add(box.els.backHalf.width.top, box.els.backHalf.width.bottom);
    box.els.backHalf.length.side.add(box.els.backHalf.length.top, box.els.backHalf.length.bottom);
}

// --------------------------------------------------
// Update Box Panels Transformation (Initial positions)
function updatePanelsTransform() {
    const cos = Math.cos(box.animated.openingAngle);
    const sin = Math.sin(box.animated.openingAngle);

    // Update positions and rotations
    updatePanelPositions(cos, sin);
    updatePanelRotations();
}

function updatePanelPositions(cos, sin) {
    // Front half width side
    box.els.frontHalf.width.side.position.set(0, 0, 0.5 * box.params.length);

    // Back half width side
    box.els.backHalf.width.side.position.set(0, 0, -0.5 * box.params.length);

    // Front half length side (opening animation)
    box.els.frontHalf.length.side.position.set(-0.5 * cos * box.params.width, 0, 0.5 * sin * box.params.width);

    // Back half length side (opening animation)
    box.els.backHalf.length.side.position.set(0.5 * cos * box.params.width, 0, -0.5 * sin * box.params.width);
}

function updatePanelRotations() {
    // Width side rotations
    box.els.frontHalf.width.side.rotation.y = box.animated.openingAngle;
    box.els.backHalf.width.side.rotation.y = -box.animated.openingAngle;

    // Length side rotations
    box.els.frontHalf.length.side.rotation.y = Math.PI / 2;
    box.els.backHalf.length.side.rotation.y = -Math.PI / 2;

    // Flaps' rotation angles
    setFlapRotations();
}

function setFlapRotations() {
    const angle = 29.8;

    // Back half flaps
    box.els.backHalf.width.bottom.rotation.x = angle;
    box.els.backHalf.length.bottom.rotation.x = angle;

    // Front half flaps
    box.els.frontHalf.width.bottom.rotation.x = -angle;
    box.els.frontHalf.length.bottom.rotation.x = angle;

    // Top flaps
    box.els.backHalf.width.top.rotation.x = 0.5;
    box.els.backHalf.length.top.rotation.x = -angle;
    box.els.frontHalf.width.top.rotation.x = -0.5;
    box.els.frontHalf.length.top.rotation.x = -angle;

    // Adjust positions for alignment
    setFlapPositions();
}

function setFlapPositions() {
    const depthOffset = 0.5 * box.params.depth;
    box.els.backHalf.width.bottom.position.y = -depthOffset;
    box.els.backHalf.length.bottom.position.y = -depthOffset;
    box.els.frontHalf.width.bottom.position.y = -depthOffset;
    box.els.frontHalf.length.bottom.position.y = -depthOffset;
}

// --------------------------------------------------
// Create Box Elements (geometry and flaps)
function createBoxElements() {
    for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
        for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
            const half = halfIdx ? 'frontHalf' : 'backHalf';
            const side = sideIdx ? 'width' : 'length';

            const sideWidth = side === 'width' ? box.params.width : box.params.length;
            const flapWidth = sideWidth - 2 * box.params.flapGap;
            const flapHeight = 0.375 * box.params.width - 0.75 * box.params.flapGap;

            // Create geometries for sides and flaps
            createGeometries(half, side, sideWidth, flapWidth, flapHeight);
        }
    }

    updatePanelsTransform();
}

function createGeometries(half, side, sideWidth, flapWidth, flapHeight) {
    const sidePlaneGeometry = new THREE.PlaneGeometry(sideWidth, box.params.depth);
    const flapPlaneGeometry = new THREE.PlaneGeometry(flapWidth, flapHeight);

    const sideGeometry = sidePlaneGeometry.clone();
    const topGeometry = flapPlaneGeometry.clone();
    const bottomGeometry = flapPlaneGeometry.clone();

    // Adjust flap geometries
    topGeometry.translate(0, 0.5 * flapHeight, 0);
    bottomGeometry.translate(0, -0.5 * flapHeight, 0);

    // Assign geometries to corresponding parts
    box.els[half][side].top.geometry = topGeometry;
    box.els[half][side].side.geometry = sideGeometry;
    box.els[half][side].bottom.geometry = bottomGeometry;

    // Set initial flap positions
    box.els[half][side].top.position.y = 0.5 * box.params.depth;
    box.els[half][side].bottom.position.y = -0.5 * box.params.depth;
}


