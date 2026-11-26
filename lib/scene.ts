import { assemblyAt } from "./aquarium/assembly";
import { aquariumCamera } from "./aquarium/camera";
import { buildFish, createSchool, updateSchool } from "./aquarium/fish";
import { lookAt, Mesh, multiply, orthographic, type Vec3 } from "./aquarium/geometry";
import { buildHabitat, groundHeight } from "./aquarium/habitat";
import { fragmentSource, material, shadowFragment, shadowVertex, vertexSource } from "./aquarium/shaders";
import { buildTank } from "./aquarium/tank";
import { buildWood } from "./aquarium/wood";

interface Batch {
  vao: WebGLVertexArrayObject;
  count: number;
  type: number;
  surface: number;
}

const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

function createProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL program unavailable");
  const shaders: WebGLShader[] = [];
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("WebGL shader unavailable");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        shaders.map((shader) => gl.getShaderInfoLog(shader)).join(" ") + gl.getProgramInfoLog(program),
      );
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    shaders.forEach((shader) => gl.deleteShader(shader));
  }
}

function studioShadow() {
  const mesh = new Mesh();
  const normal: Vec3 = [0, 1, 0],
    black: Vec3 = [0, 0, 0];
  const y = -1.772;
  mesh.quad(
    mesh.vertex([-6, y, -4], normal, black),
    mesh.vertex([-6, y, 4], normal, black),
    mesh.vertex([6, y, 4], normal, black),
    mesh.vertex([6, y, -4], normal, black),
  );
  return mesh;
}

function oxygenBubbles() {
  const mesh = new Mesh();
  const stems = [
    [-2.7, -0.72],
    [-1.53, -0.65],
    [2.54, 0.2],
    [2.81, -0.75],
    [-2.88, 0.51],
  ];
  for (let i = 0; i < 31; i++) {
    const cluster = stems[i % stems.length];
    const seed = (i * 0.61803399) % 1;
    const x = cluster[0] + 0.22 * Math.sin(i * 5.3);
    const z = cluster[1] + 0.16 * Math.cos(i * 7.9);
    mesh.indices.push(
      mesh.vertex(
        [x, groundHeight(x, z) + 0.25 + seed * 0.46, z],
        [0, 1, 0],
        [seed, (i * 0.413) % 1, 0],
        (i * 0.7137) % 1,
      ),
    );
  }
  return mesh;
}

export function createScene(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: true,
    powerPreference: "default",
  });
  if (!gl) return null;

  const release: Array<() => void> = [];
  function dispose() {
    for (const cleanup of release.splice(0).reverse()) cleanup();
  }

  try {
    const program = createProgram(gl, vertexSource, fragmentSource);
    release.push(() => gl.deleteProgram(program));
    const depthProgram = createProgram(gl, shadowVertex, shadowFragment);
    release.push(() => gl.deleteProgram(depthProgram));
    const location = (name: string) => gl.getUniformLocation(program, name);
    const vp = location("uVP"),
      model = location("uModel"),
      surface = location("uMaterial");
    const reveal = location("uReveal"),
      waterFill = location("uWaterFill"),
      plantCover = location("uPlantCover");
    const time = location("uTime"),
      eye = location("uEye"),
      phase = location("uTailPhase");

    function upload(mesh: Mesh, surface: number): Batch {
      const ctx = gl!;
      const vao = ctx.createVertexArray(),
        vbo = ctx.createBuffer(),
        ibo = ctx.createBuffer();
      release.push(() => {
        ctx.deleteVertexArray(vao);
        ctx.deleteBuffer(vbo);
        ctx.deleteBuffer(ibo);
      });
      if (!vao || !vbo || !ibo) throw new Error("WebGL mesh allocation failed");
      ctx.bindVertexArray(vao);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(mesh.vertices), ctx.STATIC_DRAW);
      const offsets = [0, 3, 6, 9, 10];
      for (let i = 0; i < offsets.length; i++) {
        ctx.enableVertexAttribArray(i);
        ctx.vertexAttribPointer(i, i < 3 ? 3 : 1, ctx.FLOAT, false, Mesh.STRIDE * 4, offsets[i] * 4);
      }
      const indices =
        mesh.vertices.length / Mesh.STRIDE > 65535
          ? new Uint32Array(mesh.indices)
          : new Uint16Array(mesh.indices);
      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, ibo);
      ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
      return {
        vao,
        count: indices.length,
        type: indices.BYTES_PER_ELEMENT === 2 ? ctx.UNSIGNED_SHORT : ctx.UNSIGNED_INT,
        surface,
      };
    }

    const tank = buildTank(),
      habitat = buildHabitat();
    const terrain = [
      upload(habitat.sand, material.sand),
      upload(habitat.rock, material.rock),
      upload(buildWood(), material.wood),
      upload(habitat.plants, material.plants),
    ];
    const tankFrame = [
      upload(tank.backing, material.backing),
      upload(tank.plinth, material.plinth),
      upload(tank.seams, material.seams),
      upload(tank.fixture, material.fixture),
      upload(tank.led, material.led),
    ];
    const glassFar = upload(tank.glassFar, material.glass),
      glassNear = upload(tank.glassNear, material.glass);
    const water = upload(tank.water, material.water),
      meniscus = upload(tank.meniscus, material.meniscus);
    const shadow = upload(studioShadow(), material.shadow);
    const pearls = upload(oxygenBubbles(), material.pearls);
    const fishMesh = upload(buildFish(), material.fish),
      school = createSchool();

    function drawGeometry(batch: Batch) {
      gl!.bindVertexArray(batch.vao);
      gl!.drawElements(gl!.TRIANGLES, batch.count, batch.type, 0);
    }
    function drawBatch(batch: Batch, amount = 1) {
      gl!.uniform1i(surface, batch.surface);
      gl!.uniform1f(reveal, amount);
      drawGeometry(batch);
    }

    // Cache the geometry as seen from the lamp and from above. Both maps must
    // follow the assembly or unrevealed objects would already cast shadows.
    const lightVP = multiply(orthographic(9.6, 6.2, 0.2, 16), lookAt([-2.1, 7.1, 2.7], [0, 0, 0]));
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) throw new Error("WebGL depth framebuffer unavailable");
    release.push(() => gl.deleteFramebuffer(framebuffer));
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.polygonOffset(1.3, 1.5);
    const depthVP = gl.getUniformLocation(depthProgram, "uLightVP");
    const depthMaterial = gl.getUniformLocation(depthProgram, "uMaterial");
    const depthReveal = gl.getUniformLocation(depthProgram, "uReveal");
    function depthTarget(view: Float32Array, unit: number, size: number, compare: boolean) {
      const ctx = gl!;
      const depth = ctx.createTexture();
      if (!depth) throw new Error("WebGL depth texture unavailable");
      release.push(() => ctx.deleteTexture(depth));
      ctx.activeTexture(ctx.TEXTURE0 + unit);
      ctx.bindTexture(ctx.TEXTURE_2D, depth);
      ctx.texStorage2D(ctx.TEXTURE_2D, 1, ctx.DEPTH_COMPONENT24, size, size);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, compare ? ctx.LINEAR : ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, compare ? ctx.LINEAR : ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
      if (compare) {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_COMPARE_MODE, ctx.COMPARE_REF_TO_TEXTURE);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_COMPARE_FUNC, ctx.LEQUAL);
      }
      ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.TEXTURE_2D, depth, 0);
      if (ctx.checkFramebufferStatus(ctx.FRAMEBUFFER) !== ctx.FRAMEBUFFER_COMPLETE) {
        throw new Error("WebGL depth target unavailable");
      }
      return { depth, view, size };
    }
    const topDown = new Float32Array([1 / 3.7, 0, 0, 0, 0, 0, -0.5, 0, 0, -1 / 1.5, 0, 0, 0, 0, 0, 1]);
    const maps = [depthTarget(lightVP, 0, 1024, true), depthTarget(topDown, 1, 512, false)];
    function refreshLightMaps(layers: number[]) {
      const ctx = gl!;
      ctx.useProgram(depthProgram);
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, framebuffer);
      ctx.enable(ctx.POLYGON_OFFSET_FILL);
      for (const { depth, view, size } of maps) {
        ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.TEXTURE_2D, depth, 0);
        ctx.viewport(0, 0, size, size);
        ctx.clear(ctx.DEPTH_BUFFER_BIT);
        ctx.uniformMatrix4fv(depthVP, false, view);
        terrain.forEach((batch, i) => {
          const amount = layers[i + 1];
          if (amount === 0) return;
          ctx.uniform1i(depthMaterial, batch.surface);
          ctx.uniform1f(depthReveal, amount);
          drawGeometry(batch);
        });
      }
      ctx.disable(ctx.POLYGON_OFFSET_FILL);
      ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
      ctx.viewport(0, 0, canvas.width, canvas.height);
      ctx.useProgram(program);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(program);
    gl.uniform1i(location("uShadow"), 0);
    gl.uniform1i(location("uCanopy"), 1);
    gl.uniformMatrix4fv(location("uLightVP"), false, lightVP);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let width = 1,
      height = 1,
      quality = 1,
      lastProgress = -1;
    let layers = assemblyAt(0);
    let lastFrame = 0,
      lastSeconds = 0,
      slowFrames = 0;
    function sizeBuffer() {
      const scale =
        Math.min(window.devicePixelRatio || 1, 1.65, Math.sqrt(960000 / (width * height))) * quality;
      const w = Math.max(1, Math.round(width * scale)),
        h = Math.max(1, Math.round(height * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl!.viewport(0, 0, w, h);
    }
    function resize() {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      sizeBuffer();
      const camera = aquariumCamera(width / height);
      gl!.uniformMatrix4fv(vp, false, camera.vp);
      gl!.uniform3fv(eye, camera.eye);
    }

    function draw(progress: number, seconds: number) {
      const ctx = gl!;
      // Sustained frame misses on an integrated GPU reduce pixel work without changing swim speed.
      const now = performance.now(),
        delta = now - lastFrame;
      lastFrame = now;
      if (seconds === lastSeconds) {
        // Paused and reduced-motion frames are requested by individual scroll events.
        slowFrames = 0;
      } else {
        slowFrames =
          delta > 30 && delta < 500 ? slowFrames + (delta > 65 ? 3 : 1) : Math.max(0, slowFrames - 1);
      }
      lastSeconds = seconds;
      if (slowFrames >= 22 && quality > 0.65) {
        quality = Math.max(0.65, quality * 0.85);
        slowFrames = 0;
        sizeBuffer();
      }
      if (lastProgress !== progress) {
        const next = assemblyAt(progress);
        if (lastProgress < 0 || terrain.some((_, i) => layers[i + 1] !== next[i + 1])) {
          refreshLightMaps(next);
        }
        layers = next;
        lastProgress = progress;
      }
      ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
      ctx.uniform1f(waterFill, layers[0]);
      ctx.uniform1f(plantCover, layers[4]);
      ctx.uniform1f(time, seconds);
      ctx.uniformMatrix4fv(model, false, identity);
      ctx.enable(ctx.BLEND);
      ctx.depthMask(false);
      drawBatch(shadow);
      ctx.disable(ctx.BLEND);
      ctx.depthMask(true);
      for (const batch of tankFrame) drawBatch(batch);
      terrain.forEach((batch, i) => {
        if (layers[i + 1] > 0) drawBatch(batch, layers[i + 1]);
      });
      if (layers[5] > 0) {
        updateSchool(school, seconds);
        if (layers[5] < 1) ctx.enable(ctx.BLEND);
        ctx.uniform1i(surface, material.fish);
        ctx.bindVertexArray(fishMesh.vao);
        school.forEach((fish, i) => {
          const delay = (0.36 * i) / (school.length - 1);
          const amount = Math.max(0, Math.min(1, (layers[5] - delay) / (1 - delay)));
          if (amount === 0) return;
          ctx.uniform1f(reveal, amount);
          ctx.uniformMatrix4fv(model, false, fish.model);
          ctx.uniform1f(phase, fish.tailPhase);
          ctx.drawElements(ctx.TRIANGLES, fishMesh.count, fishMesh.type, 0);
        });
      }
      ctx.uniformMatrix4fv(model, false, identity);
      ctx.enable(ctx.BLEND);
      ctx.depthMask(false);
      if (layers[4] > 0) {
        ctx.uniform1i(surface, material.pearls);
        ctx.uniform1f(reveal, layers[4]);
        ctx.bindVertexArray(pearls.vao);
        ctx.drawElements(ctx.POINTS, pearls.count, pearls.type, 0);
      }
      drawBatch(glassFar);
      if (layers[0] > 0) {
        drawBatch(water, layers[0]);
        drawBatch(meniscus, layers[0]);
      }
      drawBatch(glassNear);
      ctx.depthMask(true);
      ctx.disable(ctx.BLEND);
    }
    return { draw, resize, dispose };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("Ondine aquarium", error);
    dispose();
    return null;
  }
}
