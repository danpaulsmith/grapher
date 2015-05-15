uniform vec2 u_resolution;
attribute vec2 a_position;
attribute float a_rgb;
attribute float a_alpha;
varying vec4 rgba;
varying vec2 position;
varying vec2 resolution;
void main() {
  vec2 clipspace = a_position / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);
  float c = a_rgb;
  rgba.b = mod(c, 256.0); c = floor(c / 256.0);
  rgba.g = mod(c, 256.0); c = floor(c / 256.0);
  rgba.r = mod(c, 256.0); c = floor(c / 256.0);
  rgba.a = a_alpha; rgba /= 255.0;
}