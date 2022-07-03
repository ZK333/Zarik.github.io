function Color(min) {
    min = min || 0;
    this.r = colorValue(min);
    this.g = colorValue(min);
    this.b = colorValue(min);
    this.style = createColorStyle(this.r, this.g, this.b);
};

function colorValue(min) {
   return Math.floor(Math.random() * 255 + min);
}

function createColorStyle(r,g,b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 1)'; // originally, this alpha was 0.8
}

// Dist function
function d2Dist(p1, p2){
    var dx = p1.px - p2.px;
    var dy = p1.py - p2.py;
    return Math.sqrt(dx*dx + dy*dy);
}

function Controller(){
    var self = this;
    self.canvas = document.getElementById("screen");
    self.ctx = self.canvas.getContext('2d');

    self.drawCurve = function(control, p1, p2, radius){
        var ctx = self.ctx;
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.arcTo(control.px, control.py, p2.px, p2.py, radius);
        ctx.lineWidth = 1;
        ctx.strokeStyle = self.color.style;
        ctx.stroke();
    }

    self.drawLine = function(control, p){
        var ctx = self.ctx;
        ctx.beginPath();
        ctx.moveTo(control.px, control.py);
        ctx.lineTo(p.px, p.py);
        ctx.lineWidth = 1;
        ctx.strokeStyle = self.color.style;
        ctx.stroke();
    }

    self.drawNext = function(part){
        part.func(part.control, part.p1, part.p2, part.radius);
    }

    self.drawPart = function(){
        if(self.objectsToDraw.length > 0){
            self.lastRequestId = requestAnimationFrame(function(){
                self.drawNext(self.objectsToDraw.shift());
                self.drawPart();
                // self.color = new Color(64); // Uncomment to a colorful web!
            });
        }
    }

    self.shuffleArray = function(target){
        var auxArray = [];
        while(target.length > 0){
            auxArray.push(target.shift());
        }

        while(auxArray.length > 0){
            var n = Math.floor(Math.random() * auxArray.length);
            for(var i = 0; i < n; i++){
                auxArray.push(auxArray.shift());
            }
            var x = auxArray.shift();
            //if(Math.random() * 100 >= 30){    // uncomment those (and line 134) to make a flawed web
                target.push(x);
            //}                                 // uncomment those (and line 134) to make a flawed web
        }
    }

    self.drawWebByParts = function(){
        self.ctx.clearRect(0, 0, self.screenWidth, self.screenHeight);
        var controlPoint = {px: self.screenWidth / 2, py: self.screenHeight / 2};
        var outerRadius = Math.min(self.screenWidth / 2, self.screenHeight / 2) + 300;
        var nLines = 18;
        var deltaAngle = 360 / nLines;
        var degree = Math.PI / 180;
        var points = [];
        for(var i = 0; i < nLines; i++){
            points.push({
                px: controlPoint.px + outerRadius * Math.cos(i * deltaAngle * degree),
                py: controlPoint.py + outerRadius * Math.sin(i * deltaAngle * degree)
            });
        }
        var linesToDraw = [];
        for(var i = 0; i < points.length; i++){
            linesToDraw.push({
                control: controlPoint,
                p1: points[i],
                func: self.drawLine
            });
        }
        
        var nArcs = 18;
        var dist = d2Dist(points[0], points[1]) / 2;
        var deltaRadius = dist / nArcs;

        var arcsToDraw = [];
        for(var j = 1; j <= nArcs; j++){
            for(var i = 0; i < points.length; i++){
                var p1 = points[i % points.length];
                var p2 = points[(i+1) % points.length];

                arcsToDraw.push({
                    control: controlPoint,
                    p1: p1,
                    p2: p2,
                    radius: j * deltaRadius,
                    func: self.drawCurve
                });
            }
        }
        self.objectsToDraw = [];
        while(linesToDraw.length > 0){
            self.objectsToDraw.push(linesToDraw.shift());
        }

        while(arcsToDraw.length > 0){
            self.objectsToDraw.push(arcsToDraw.shift());
        }

        self.drawPart();
    }
    self.resize = function(){
        self.screenWidth = window.innerWidth;
        self.screenHeight = window.innerHeight/2;

        self.canvas.width = self.screenWidth;
        self.canvas.height = self.screenHeight;
        
        window.cancelAnimationFrame(self.lastRequestId);
        self.drawWebByParts();
    }
    self.init = function(){
        window.onresize = self.resize;
        self.color = new Color(64);
        self.resize();
    }
}
var controller = new Controller();
controller.init();
