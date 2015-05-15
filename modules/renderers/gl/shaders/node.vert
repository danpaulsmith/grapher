uniform vec2 u_resolution;
attribute vec2 a_position;
attribute float a_rgb;
attribute float a_alpha;
attribute vec2 a_center;
attribute float a_radius;
varying vec4 rgba;
varying vec2 center;
varying vec2 resolution;
varying float radius;
void main() {
  vec2 clipspace = a_position / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);
  float c = a_rgb;
  rgba.b = mod(c, 256.0); c = floor(c / 256.0);
  rgba.g = mod(c, 256.0); c = floor(c / 256.0);
  rgba.r = mod(c, 256.0); c = floor(c / 256.0);
  rgba.a = a_alpha; rgba/= 255.0;
  radius = a_radius;
  center = a_center;
  resolution = u_resolution;
}
