// Materials share a vertex layout so each part of the aquascape can be batched.
export const material = {
  sand: 1,
  rock: 2,
  wood: 3,
  plants: 4,
  fish: 5,
  plinth: 6,
  fixture: 7,
  led: 8,
  backing: 9,
  seams: 10,
  glass: 11,
  water: 12,
  meniscus: 13,
  shadow: 14,
  pearls: 15,
} as const;

// Both light maps use exactly the same assembly pose as the visible geometry.
const assembly = `
layout(location=4) in float aAnchor;
uniform float uReveal;
uniform int uMaterial;
vec3 assemble(vec3 p, out float verticalScale) {
  verticalScale = 1.0;
  if (uMaterial < 1 || uMaterial > 4 || uReveal >= 1.0) return p;

  // The sand spreads along the bed; rooted groups and individual rocks follow
  // slightly different timings so adjoining elements don't rise in lockstep.
  float delay = 0.0;
  if (uMaterial == 1) delay = 0.35*clamp(0.49+p.x*0.081-p.z*0.13,0.0,1.0);
  if (uMaterial == 2 || uMaterial == 4) delay = 0.19*fract(abs(aAnchor)*13.71);
  float t = clamp((uReveal-delay)/(1.0-delay),0.0,1.0);
  if (uMaterial == 1) {
    verticalScale = t;
    p.y = mix(aAnchor-0.054,p.y,t);
  } else if (uMaterial == 4) {
    verticalScale = t;
    p.y = aAnchor + (p.y-aAnchor)*t - (1.0-t)*0.13;
  } else {
    // Keep the silhouettes of the rocks and root as they emerge from the bank.
    verticalScale = mix(0.70,1.0,t);
    float travel = uMaterial == 2 ? 1.88 : 2.48;
    p.y = aAnchor+(p.y-aAnchor)*verticalScale-travel*(1.0-t);
  }
  return p;
}`;

const waterLevel = `
uniform float uWaterFill;
uniform float uTime;
float waterHeight(vec2 xz) {
  float wave = sin(dot(xz,vec2(5.1,3.7)) + uTime*1.21)*0.005
             + sin(dot(xz,vec2(-3.4,6.9)) - uTime*0.84)*0.0035;
  return mix(-1.45,1.53,uWaterFill) + wave*smoothstep(0.0,0.045,uWaterFill);
}`;

export const vertexSource = `#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aColor;
layout(location=3) in float aMotion;
uniform mat4 uVP, uLightVP, uModel;
uniform float uTailPhase, uPlantCover;
out vec3 vWorld, vNormal, vColor, vShadow;
out float vFiber;
${assembly}
${waterLevel}
void main() {
  float verticalScale;
  vec3 p = assemble(aPosition,verticalScale);
  vec3 n = vec3(aNormal.x,aNormal.y/max(0.035,verticalScale),aNormal.z);
  if (uMaterial == 4) {
    float current = sin(p.z*1.6 + p.x*1.15 - uTime*1.4);
    float eddy = sin(p.x*3.7 - p.y*0.9 - uTime*1.9);
    float bend = aMotion*verticalScale;
    p.x += (0.040*current + 0.013*eddy)*bend;
    p.z += 0.019*sin(p.x + uTime)*bend;
    n.x -= 0.055*current*bend;
  } else if (uMaterial == 5) {
    float bend = uTailPhase + p.x*5.0;
    p.z += 0.105*aMotion*sin(bend);
    n.x -= n.z*aMotion*0.38*cos(bend);
    p.x -= 0.35*(1.0-uReveal);
  } else if (uMaterial == 12 || uMaterial == 13) {
    p.y += waterHeight(p.xz)-1.53;
  } else if (uMaterial == 15) {
    float age = fract(aMotion+uTime*(0.069+0.042*aColor.r));
    p.y = mix(p.y,1.51,age);
    p.x += age*0.15 + 0.027*sin(8.0*age+aMotion*24.0);
    p.z += 0.034*sin(11.0*age+aMotion*15.0);
  }
  vWorld = (uModel*vec4(p,1)).xyz;
  vNormal = mat3(uModel)*n;
  vColor = aColor;
  // The planted banks green up with the leaves. Fresh soil stays brown.
  if (uMaterial == 1) vColor *= mix(vec3(1),vec3(0.860,1.192,0.757),aMotion*uPlantCover);
  vFiber = aMotion;
  vShadow = (uLightVP*vec4(vWorld,1)).xyz*0.5+0.5;
  gl_Position = uVP*vec4(vWorld,1);
  if (uMaterial == 15) {
    gl_PointSize = clamp((11.0+8.0*aColor.g)/gl_Position.w,1.1,3.6);
  }
}`;

export const fragmentSource = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DShadow;
in vec3 vWorld, vNormal, vColor, vShadow;
in float vFiber;
out vec4 pixel;
uniform vec3 uEye;
uniform float uReveal;
uniform int uMaterial;
uniform sampler2DShadow uShadow;
uniform sampler2D uCanopy;
${waterLevel}

float submerged(vec3 p) {
  return smoothstep(-0.012,0.012,waterHeight(p.xz)-p.y)*smoothstep(0.0,0.032,uWaterFill);
}

float hash(vec3 p) {
  p = fract(p*vec3(0.1031,0.1030,0.0973));
  p += dot(p,p.yxz+33.33);
  return fract((p.x+p.y)*p.z);
}
float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p); f=f*f*(3.0-2.0*f);
  vec4 a = vec4(hash(i),hash(i+vec3(1,0,0)),hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)));
  i.z += 1.0;
  vec4 b = vec4(hash(i),hash(i+vec3(1,0,0)),hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)));
  vec4 ab = mix(a,b,f.z);
  return mix(mix(ab.x,ab.y,f.x),mix(ab.z,ab.w,f.x),f.y);
}
float coverage(vec3 coord) {
  if (any(lessThan(coord,vec3(0.0))) || any(greaterThan(coord,vec3(1.0)))) return 1.0;
  vec2 texel = 1.0/vec2(textureSize(uShadow,0));
  float z = coord.z-0.0015;
  return 0.25*(texture(uShadow,vec3(coord.xy+texel*vec2(-0.85,-0.40),z))
             + texture(uShadow,vec3(coord.xy+texel*vec2( 0.40,-0.85),z))
             + texture(uShadow,vec3(coord.xy+texel*vec2( 0.85, 0.40),z))
             + texture(uShadow,vec3(coord.xy+texel*vec2(-0.40, 0.85),z)));
}
// A top-down height field measures how much of the diffuse sky light is
// blocked by neighbouring stones, overhanging wood and leaves.
float horizon(vec3 p, vec2 offset) {
  vec2 uv = (p.xz+offset)*vec2(1.0/7.4,-1.0/3.0)+0.5;
  float top = (0.5-texture(uCanopy,clamp(uv,0.0,1.0)).r)*4.0;
  return clamp((top-p.y-0.038)/(length(offset)+0.07),0.0,1.0);
}
float occlusion(vec3 p,vec3 n) {
  vec3 s = p+normalize(n)*0.074;
  return (horizon(s,vec2(0.13,0.08))+horizon(s,vec2(-0.08,0.15))+
    horizon(s,vec2(-0.15,-0.08))+horizon(s,vec2(0.08,-0.15))+
    horizon(s,vec2(0.34,-0.21))+horizon(s,vec2(-0.34,0.21)))/6.0;
}
// Overlapping waves generate travelling, broken bands of light under the surface.
float caustic(vec3 p) {
  vec2 c = p.xz + vec2(0.35,0.21)*p.y;
  float t = uTime*0.31;
  float a = sin(c.x*7.8 + c.y*3.1 + sin(c.y*4.0-t)*1.55 + t);
  float b = sin(c.y*7.3 - c.x*2.6 + sin(c.x*4.1+t*0.8)*1.40 - t*0.75);
  return pow(1.0-clamp(abs(a+b)*0.75,0.0,1.0),8.0);
}
vec3 relief(vec3 p,vec3 n,float height) {
  vec3 dx=dFdx(p), dy=dFdy(p);
  vec3 tx=cross(dy,n), ty=cross(n,dx);
  float determinant=dot(dx,tx);
  vec3 grad=dFdx(height)*tx+dFdy(height)*ty;
  return normalize(max(abs(determinant),1.e-8)*n - sign(determinant)*grad);
}

void main() {
  vec3 p = vWorld, n = normalize(vNormal), eye = normalize(uEye-p);
  if (uMaterial <= 4 && uReveal < 1.0 && p.y < -1.45) discard;
  vec3 light = normalize(vec3(-2.1,7.1,2.7));
  float ndl = dot(light,n), facing = abs(dot(n,eye));
  vec3 base = vColor;
  if (uMaterial == 15) {
    vec2 pt = 2.0*gl_PointCoord-1.0;
    float d=length(pt);
    float edge=1.0-smoothstep(0.72,1.0,d);
    float glint=exp(-5.5*dot(pt+vec2(0.31,0.37),pt+vec2(0.31,0.37)));
    float opacity=smoothstep(-1.2,-0.50,p.y)*(1.0-smoothstep(1.44,1.53,p.y));
    pixel=vec4(mix(vec3(0.40,0.62,0.59),vec3(0.90,0.99,0.90),glint),edge*opacity*(0.20+0.55*glint)*uReveal);
    return;
  }
  if (uMaterial == 14) {
    vec2 edge = max(abs(p.xz-vec2(0.13,-0.12))-vec2(3.48,1.28),0.0);
    float d = dot(edge,edge);
    pixel = vec4(0.006,0.025,0.025,0.46*exp(-d*5.0) + 0.19*exp(-d*0.94));
    return;
  }
  if (uMaterial == 8) {
    pixel=vec4(base,1);
    return;
  }
  if (uMaterial == 11) {
    float fresnel = pow(1.0-facing,4.5);
    vec3 ray = reflect(-eye,n);
    float strip = exp(-15.0*abs(ray.x+0.55*ray.y+0.46));
    float wet = submerged(p);
    float inside = smoothstep(0.0,0.45,-dot(n,eye))*abs(n.x)*wet;
    vec3 reflected = mix(vec3(0.53,0.82,0.79),vec3(0.92,0.98,0.93),strip);
    vec3 scatter = mix(vec3(0.10,0.23,0.20),vec3(0.46,0.62,0.55),smoothstep(-1.35,1.6,p.y)*0.80);
    // A faint change in transmission on the front glass makes the rising
    // water visible even when seen straight through the tank.
    float fillBand = wet*abs(n.z)*0.09*(1.0-uWaterFill);
    pixel = vec4(mix(reflected,scatter,min(1.0,inside+fillBand)),
                 0.015+fresnel*0.105+strip*0.037+inside*0.65+fillBand);
    return;
  }
  if (uMaterial == 12 || uMaterial == 13) {
    vec2 uv = p.xz;
    float t=uTime;
    n = normalize(vec3(-0.030*cos(dot(uv,vec2(5.1,3.7))+t*1.21)
                       +0.015*cos(dot(uv,vec2(-3.4,6.9))-t*0.84),1.0,
                       -0.022*cos(dot(uv,vec2(5.1,3.7))+t*1.21)
                       -0.028*cos(dot(uv,vec2(-3.4,6.9))-t*0.84)));
    vec3 ray = reflect(-eye,n);
    vec3 toLamp = normalize(vec3(clamp(p.x+ray.x*2.8,-2.7,2.7),2.1,-0.08)-p);
    float glint = pow(max(0.0,dot(toLamp,ray)),54.0);
    float sheen = pow(1.0-max(dot(n,eye),0.0),4.0);
    float crest = smoothstep(0.70,0.98,sin(uv.x*7.0+sin(uv.y*6.0-t)+uv.y*11.0+t));
    vec3 color = mix(vec3(0.36,0.63,0.62),vec3(0.90,0.99,0.94),glint+crest*0.30);
    float opacity = uMaterial==13 ? 0.50+0.16*crest : 0.08+0.20*sheen+0.37*glint+0.04*crest;
    pixel = vec4(color,opacity*smoothstep(0.0,0.052,uWaterFill));
    return;
  }
  if (uMaterial == 1) {
    float grain = noise3(p*110.0);
    base *= 0.84+0.26*grain+0.07*noise3(p*29.0);
    n = relief(p,n,grain*0.0023);
  } else if (uMaterial == 2) {
    float broad = noise3(p*3.8);
    float grit = noise3(p*49.0);
    float flake = noise3(p*vec3(17.0,29.0,21.0));
    float strata = dot(p,vec3(-3.2,5.1,1.9)) + 1.45*broad + 0.24*flake;
    float fissure = (1.0-smoothstep(0.025,0.24,abs(sin(strata*3.1))))*smoothstep(0.24,0.59,flake);
    float crystal = smoothstep(0.77,0.87,grit)*smoothstep(0.45,0.74,broad);
    base = base*(0.64+0.31*broad+0.25*grit+0.14*flake-0.22*fissure)
         + vec3(0.22,0.19,0.14)*crystal;
    n = relief(p,n,0.023*broad+0.0048*flake+0.0018*grit-0.0060*fissure);
  } else if (uMaterial == 3) {
    float grain = noise3(p*vec3(11.0,26.0,22.0));
    float theta = vFiber*6.2831853;
    float split = sin(theta*16.0+1.8*sin(theta*3.0)+0.47*noise3(p*3.7));
    float ridge = smoothstep(0.50,0.99,split);
    base *= 0.75+0.32*grain+0.14*noise3(p*4.0)-0.14*ridge;
    n = relief(p,n,0.0035*grain-0.004*ridge);
  } else if (uMaterial == 6) {
    base *= 0.91+noise3(p*vec3(1.6,74.0,42.0))*0.18;
  }
  float lit = coverage(vShadow);
  if (uMaterial == 9) {
    float spot = exp(-0.082*p.x*p.x - 0.25*(p.y-0.75)*(p.y-0.75));
    base *= (0.80+0.20*lit);
    float refraction = sin(p.x*3.2+p.y*1.7+sin(p.x*4.0-uTime*0.45))*0.009;
    float glow = smoothstep(-1.25,1.6,p.y)*spot;
    float column = sin(p.x*4.6+p.y*0.90 + sin(p.x*6.3+p.y*0.43+uTime*0.18)*0.5);
    vec3 veil = vec3(0.23,0.22,0.12)*(glow*0.88+glow*column*0.053);
    vec3 water = base + vec3(0.045,0.065,0.038)*spot + veil + refraction*spot;
    vec3 dry = mix(vec3(0.105,0.155,0.150),vec3(0.43,0.465,0.43),0.60*spot+0.24*glow);
    dry += n.y*vec3(0.055,0.047,0.037);
    pixel = vec4(mix(dry,water,submerged(p)),1.0);
    return;
  }

  float diffuse = max(dot(n,light),0.0);
  float ambient = 0.51+0.14*n.y+0.058*max(n.z,0.0);
  if (uMaterial == 4) {
    // Rear-lit leaf blades transmit green light through their thin lamina.
    diffuse = 0.44*abs(ndl) + 0.56*max(ndl,0.0);
    ambient += 0.06;
  }
  float shade = uMaterial<=5 ? occlusion(p,n) : 0.0;
  vec3 color = base*(vec3(0.91,0.986,1.0)*ambient*(1.0-0.46*shade)
    + vec3(1.0,0.985,0.91)*0.69*diffuse*lit);
  float spec = pow(max(dot(n,normalize(eye+light)),0.0),uMaterial==5 ? 38.0 : 24.0);
  if (uMaterial<=5) {
    color += base*caustic(p)*(0.045+0.20*diffuse)*lit;
    color += vec3(0.87,0.97,1.0)*spec*(uMaterial==5 ? 0.32 : 0.044)*lit;
    if (uMaterial==5) color += vec3(0.03,0.08,0.09)*pow(1.0-facing,2.0);
    // Mineral particles scatter progressively more light through the back of the tank.
    float depth = clamp((1.48-p.z)/3.0,0.0,1.0);
    color = mix(color,vec3(0.33,0.52,0.44),0.012+0.080*depth*depth);
  } else {
    color += vec3(0.88,0.93,0.91)*spec*(uMaterial==10 ? 0.30 : 0.12);
  }
  pixel = vec4(color,uMaterial==5 ? uReveal : 1.0);
}`;

export const shadowVertex = `#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec3 aPosition;
uniform mat4 uLightVP;
out float vHeight;
${assembly}
void main() {
  float verticalScale;
  vec3 p = assemble(aPosition,verticalScale);
  vHeight = p.y;
  gl_Position = uLightVP*vec4(p,1);
}`;

export const shadowFragment = `#version 300 es
precision highp float;
in float vHeight;
uniform float uReveal;
void main() {
  if (uReveal < 1.0 && vHeight < -1.45) discard;
}`;
