;(function () {
  var LinkVertexShaderSource = require('./shaders/link.vert'),
      LinkFragmentShaderSource = require('./shaders/link.frag'),
      NodeVertexShaderSource = require('./shaders/node.vert'),
      NodeFragmentShaderSource = require('./shaders/node.frag'),
      Renderer = require('../renderer.js'),
      Color = require('../../helpers/color.js');

  var WebGLRenderer = Renderer.extend({
    init: function (o) {
      this.gl = o.webGL;
      
      this.linkVertexShader = o.linkShaders && o.linkShaders.vertexCode || LinkVertexShaderSource;
      this.linkFragmentShader = o.linkShaders && o.linkShaders.fragmentCode || LinkFragmentShaderSource;
      this.nodeVertexShader = o.nodeShaders && o.nodeShaders.vertexCode ||  NodeVertexShaderSource;
      this.nodeFragmentShader = o.nodeShaders && o.nodeShaders.fragmentCode || NodeFragmentShaderSource;


      this._super(o);
      this.initGL();

      this.NODE_ATTRIBUTES = 7;
      this.LINKS_ATTRIBUTES = 4;
    },

    initGL: function (gl) {
      if (gl) this.gl = gl;

      this.linksProgram = this.initShaders(this.linkVertexShader, this.linkFragmentShader);
      this.nodesProgram = this.initShaders(this.nodeVertexShader, this.nodeFragmentShader);

      this.gl.linkProgram(this.linksProgram);
      this.gl.linkProgram(this.nodesProgram);

      this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.enable(this.gl.BLEND);
    },

    initShaders: function (vertexShaderSource, fragmentShaderSource) {
      var vertexShader = this.getShaders(this.gl.VERTEX_SHADER, vertexShaderSource);
      var fragmentShader = this.getShaders(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
      var shaderProgram = this.gl.createProgram();
      this.gl.attachShader(shaderProgram, vertexShader);
      this.gl.attachShader(shaderProgram, fragmentShader);
      return shaderProgram;
    },

    getShaders: function (type, source) {
      var shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      return shader;
    },

    updateNodesBuffer: function () {
      var j = 0;
      this.nodes = [];
      for (var i = 0; i < this.nodeObjects.length; i++) {
        var node = this.nodeObjects[i];
        var cx = this.transformX(node.x) * this.resolution;
        var cy = this.transformY(node.y) * this.resolution;
        var r = node.r * Math.abs(this.scale * this.resolution) + 1;
        // adding few px to keep shader area big enough for antialiasing pixesls
        var shaderSize = r + 10;
        var rgba = Color.fromIntToRgba(node.color);
        var rgb = Color.fromRgbToInt(rgba.r, rgba.g, rgba.b);

        this.nodes[j++] = (cx - shaderSize);
        this.nodes[j++] = (cy - shaderSize);
        this.nodes[j++] = rgb;
        this.nodes[j++] = rgba.a;
        this.nodes[j++] = cx;
        this.nodes[j++] = cy;
        this.nodes[j++] = r;

        this.nodes[j++] = (cx + (1 + Math.sqrt(2)) * shaderSize);
        this.nodes[j++] = cy - shaderSize;
        this.nodes[j++] = rgb;
        this.nodes[j++] = rgba.a;
        this.nodes[j++] = cx;
        this.nodes[j++] = cy;
        this.nodes[j++] = r;

        this.nodes[j++] = (cx - shaderSize);
        this.nodes[j++] = (cy + (1 + Math.sqrt(2)) * shaderSize);
        this.nodes[j++] = rgb;
        this.nodes[j++] = rgba.a;
        this.nodes[j++] = cx;
        this.nodes[j++] = cy;
        this.nodes[j++] = r;
      }
    },

    updateLinksBuffer: function () {
      var j = 0;
      this.links = [];
      for (var i = 0; i < this.linkObjects.length; i++) {
        var link = this.linkObjects[i];
        var x1 = this.transformX(link.x1) * this.resolution;
        var y1 = this.transformY(link.y1) * this.resolution;
        var x2 = this.transformX(link.x2) * this.resolution;
        var y2 = this.transformY(link.y2) * this.resolution;
        var rgba = Color.fromIntToRgba(link.color);
        var rgb = Color.fromRgbToInt(rgba.r, rgba.g, rgba.b);


        this.links[j++] = x1;
        this.links[j++] = y1;
        this.links[j++] = rgb;
        this.links[j++] = rgba.a;

        this.links[j++] = x2;
        this.links[j++] = y2;
        this.links[j++] = rgb;
        this.links[j++] = rgba.a;
      }
    },

    resize: function (width, height) {
      this._super(width, height);
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    },

    render: function () {
      this.resize();
      this.updateNodesBuffer();
      this.updateLinksBuffer();
      this.renderLinks(); // links have to be rendered first because of blending;
      this.renderNodes();
    },

    renderLinks: function () {
      var program = this.linksProgram;
      this.gl.useProgram(program);

      var linksBuffer = new Float32Array(this.links);
      var buffer = this.gl.createBuffer();

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, linksBuffer, this.gl.STATIC_DRAW);

      var resolutionLocation = this.gl.getUniformLocation(program, 'u_resolution');
      this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

      var positionLocation = this.gl.getAttribLocation(program, 'a_position');
      var rgbLocation = this.gl.getAttribLocation(program, 'a_rgb');
      var alphaLocation = this.gl.getAttribLocation(program, 'a_alpha');
      
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.enableVertexAttribArray(rgbLocation);
      this.gl.enableVertexAttribArray(alphaLocation);

      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, this.LINKS_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0);
      this.gl.vertexAttribPointer(rgbLocation, 1, this.gl.FLOAT, false, this.LINKS_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 8);
      this.gl.vertexAttribPointer(alphaLocation, 1, this.gl.FLOAT, false, this.LINKS_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 12);

      var lineWidthRange = this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE), // ex [1,10] 
          lineWidth = this.lineWidth * Math.abs(this.scale * this.resolution),
          lineWidthInRange = Math.min(Math.max(lineWidth, lineWidthRange[0]), lineWidthRange[1]);

      this.gl.lineWidth(lineWidthInRange);
      this.gl.drawArrays(this.gl.LINES, 0, this.links.length/this.LINKS_ATTRIBUTES);
    },

    renderNodes: function () {
      var program = this.nodesProgram;
      this.gl.useProgram(program);

      var nodesBuffer = new Float32Array(this.nodes);
      var buffer = this.gl.createBuffer();

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, nodesBuffer, this.gl.STATIC_DRAW);

      var resolutionLocation = this.gl.getUniformLocation(program, 'u_resolution');
      this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

      var positionLocation = this.gl.getAttribLocation(program, 'a_position');
      var rgbLocation = this.gl.getAttribLocation(program, 'a_rgb');
      var alphaLocation = this.gl.getAttribLocation(program, 'a_alpha');
      var centerLocation = this.gl.getAttribLocation(program, 'a_center');
      var radiusLocation = this.gl.getAttribLocation(program, 'a_radius');
      
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.enableVertexAttribArray(rgbLocation);
      this.gl.enableVertexAttribArray(alphaLocation);
      this.gl.enableVertexAttribArray(centerLocation);
      this.gl.enableVertexAttribArray(radiusLocation);

      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, this.NODE_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0);
      this.gl.vertexAttribPointer(rgbLocation, 1, this.gl.FLOAT, false, this.NODE_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 8);
      this.gl.vertexAttribPointer(alphaLocation, 1, this.gl.FLOAT, false, this.NODE_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 12);
      this.gl.vertexAttribPointer(centerLocation, 2, this.gl.FLOAT, false, this.NODE_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 16);
      this.gl.vertexAttribPointer(radiusLocation, 1, this.gl.FLOAT, false, this.NODE_ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 24);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nodes.length/this.NODE_ATTRIBUTES);
    }
  });

  if (module && module.exports) module.exports = WebGLRenderer;
})();
