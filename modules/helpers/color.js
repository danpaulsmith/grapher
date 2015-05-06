// Ayasdi Inc. Copyright 2014
// Color.js may be freely distributed under the Apache 2.0 license

var Color = module.exports = {
  interpolate: interpolate,
  parse: parse,
  toRgb: toRgb,
  toRgba: toRgba,
  toRgbString: toRgbString,
  toRgbaString: toRgbaString,
  fromRgb: fromRgb,
  fromRgba: fromRgba
};

function interpolate (a, b, amt) {
  amt = amt === undefined ? 0.5 : amt;
  var colorA = toRgba(a),
      colorB = toRgba(b),
      interpolated = {
        r: colorA.r + (colorB.r - colorA.r) * amt,
        g: colorA.g + (colorB.g - colorA.g) * amt,
        b: colorA.b + (colorB.b - colorA.b) * amt,
        a: colorA.a + (colorB.a - colorA.a) * amt
      };
  return fromRgba(interpolated.r, interpolated.g, interpolated.b, interpolated.a);
}

function parse (c) {
  var color = parseInt(c, 10); // usually NaN, in case we pass in an int for color
  if (typeof c === 'string') {
    var string = c.replace(/ /g, ''); // strip spaces immediately

    if (c.split('#').length > 1) { // hex format '#ffffff' or '#ffffffff' with alpha
      var hex = string.replace('#', '');
      if (hex.length === 6) hex = 'ff' + hex; // prepend full alpha if needed
      color = parseInt(hex, 16);
    }

    else if (c.split('rgb(').length > 1) { // rgb format 'rgb(255, 255, 255)'
      var rgb = string.substring(4, string.length-1).split(',');
      color = fromRgb(rgb[0], rgb[1], rgb[2]);
    }

    else if (c.split('rgba(').length > 1) { // rgba format 'rgba(255, 255, 255, 0.8)'
      var rgba = string.substring(5, string.length-1).split(',');
      color = fromRgba(rgba[0], rgba[1], rgba[2], Math.floor(rgba[3] * 0xff));
    }
  }
  return color;
}

function toRgb (hex) {
  return {r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff};
}

function toRgba (hex) {
  return {a: (hex >> 24) & 0xff, r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff};
}

function fromRgb (r, g, b) {
  return 0xff << 24 | r << 16 | g << 8 | b;
}

function fromRgba (r, g, b, a) {
  return a << 24 | r << 16 | g << 8 | b;
}

function toRgbString (hex) {
  var rgb = toRgb(hex);
  return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
}

function toRgbaString (hex) {
  var rgba = toRgba(hex);
  return 'rgba(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ', ' + (rgba.a / 0xff) + ')';
}