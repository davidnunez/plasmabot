var canvas;
var socket;
var calibrationMode = true;
var Motor = function(humanLabel, boardId, boardPortId, min, max, delta, polarity) {
    this.boardId = boardId;
    this.humanLabel = humanLabel;
    this.boardPortId = boardPortId;
    this.tickMax = max;
    this.tickMin = min;
    this.tickCurrent = floor(random(this.tickMax));
    this.tickTarget = this.tickCurrent;
    this.tickActual = this.tickCurrent;
    this.positionX = 40;
    this.positionY = 40;
    this.moving = false;
    this.delta = delta;
    this.polarity = polarity;
}

Motor.prototype.label = function() {
    return "" + this.boardId + this.boardPortId;
}

Motor.prototype.setMax = function(max) {
    this.tickMax = max;
}

Motor.prototype.setMin = function(min) {
    this.tickMin = min;
}

Motor.prototype.setActual = function(actual) {
    this.tickActual = actual;
    if (calibrationMode) {
        if (this.tickActual > this.tickMax) {
            this.tickMax = this.tickActual;
        }
        if (this.tickActual < this.tickMin) {
            this.tickMin = this.tickActual;
        }
    }

}

Motor.prototype.uiMap = function(value) {
    if (this.polarity == 1) {
        return map(value, this.tickMin, this.tickMax, 500, 0);
    } else {
        return map(value, this.tickMin, this.tickMax, 0, 500);

    }
}


Motor.prototype.draw = function(x, y) {
    push();
    fill('rgb(0,0,0)');
    translate(x, y);
    line(0, 0, 0, 500);
    text(this.tickMin, -textWidth(this.tickMin) / 2, -20);
    ellipse(0, this.uiMap(this.tickCurrent), 20, 20);
    line(-20, this.uiMap(this.tickActual), 20, this.uiMap(this.tickActual));

    text(floor(this.tickCurrent), -textWidth(floor(this.tickCurrent)) / 2, this.uiMap(this.tickCurrent) - 20)
    text(this.tickMax, -textWidth(this.tickMax) / 2, 520);
    text(this.label(), -textWidth(this.label()) / 2, 540);
    text(this.tickActual, -textWidth(this.tickActual) / 2, 560);
    fill('rgb(0,255,0)');
    ellipse(0, this.uiMap(this.tickTarget), 10, 10);

    pop();
}

Motor.prototype.move = function() {
    this.tickCurrent = lerp(this.tickCurrent, this.tickTarget, .04);
    var channel;
    if (this.boardPortId == 'A') {
        channel = 0;
    } else {
        channel = 1;
    }

    socket.emit('osc', [this.boardId, channel, this.tickCurrent]);
}

Motor.prototype.snapTarget = function() {
    this.tickCurrent = this.tickActual;
    this.tickTarget = this.tickCurrent;
}

var Robot = function() {
    console.log("making a robot");
    this.motors = [];

};

Robot.prototype.snapTargets = function() {
    for (var i = this.motors.length - 1; i >= 0; i--) {
        this.motors[i].snapTarget();
    };
}

Robot.prototype.setup = function() {
    console.log("setting up a robot");

    label = createElement('p', "Move Robot?");
    label.position(0, 620);
    label.elt.style.float = "right";
    label.elt.style.margin = 0;
    this.moveCheckbox = createCheckbox("", false);
    this.moveCheckbox.position(100, 620);

}



Robot.prototype.addMotor = function(motor) {
    this.motors.push(motor);
    label = createElement('p', motor.humanLabel + " " + motor.label());
    label.position(windowWidth / 2, 50 + (30 * this.motors.length));
    label.elt.style.float = "right";
    label.elt.style.margin = 0;
    b = createButton("up", motor.label());
    b.position(windowWidth / 2 + 30, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_up);


    b = createButton("upf", motor.label());
    b.position(windowWidth / 2 + 80, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_upf);

    b = createButton("down", motor.label());
    b.position(windowWidth / 2 + 130, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_down);

    b = createButton("downf", motor.label());
    b.position(windowWidth / 2 + 180, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_downf);

    b = createButton("top", motor.label());
    b.position(windowWidth / 2 + 230, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_top);

    b = createButton("bottom", motor.label());
    b.position(windowWidth / 2 + 280, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_bottom);
}

Robot.prototype.draw = function() {
    for (var i = this.motors.length - 1; i >= 0; i--) {
        this.motors[i].draw(40 + i * 40, 40);
    };
}

Robot.prototype.getPose = function() {
    console.log(this.motors);
}

Robot.prototype.getMotorsByLabel = function(label) {
    return this.motors.filter(function(motor) {
        return (motor.boardId == label[0]) &&
            (motor.boardPortId == label[1]);
    });
}

Robot.prototype.move = function() {
    if (this.moveCheckbox.checked()) {
        for (var i = this.motors.length - 1; i >= 0; i--) {
            this.motors[i].move();
        }
    };
}

var robot;

function setup() {
    robot = new Robot();
    canvas = createCanvas(windowWidth / 2, windowHeight);
    robot.addMotor(new Motor("(?)", 1, "A", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(?)", 1, "B", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(2)", 2, "A", 0, 1000, 1000, -1));
    robot.addMotor(new Motor("(5)", 2, "B", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(1)", 3, "A", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(6)", 3, "B", 0, 1000, 1000, -1));
    robot.addMotor(new Motor("(?)", 4, "A", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(?)", 4, "B", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(?)", 5, "A", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(?)", 5, "B", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(?)", 6, "A", 0, 1000, 1000, 1));
    robot.addMotor(new Motor("(?)", 6, "B", 0, 1000, 1000, 1));
    robot.setup();
    robot.getPose();

    b = createButton("Snap Targets");
    b.position(100, 640);
    b.mousePressed(on_button_snap_targets);

    socket = io.connect('localhost:8080');
    socket.on('osc',
        function(data) {
            on_osc_event(data);
        }
    );

}

function draw() {
    background(255, 255, 255);
    // draw stuff here
    robot.move();

    robot.draw();
}

function on_button_upf(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickTarget += motors[i].polarity * 100;;
        if (motors[i].tickTarget > motors[i].tickMax) {
            motors[i].tickMax = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_downf(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickTarget += -motors[i].polarity * 100;
        if (motors[i].tickTarget < motors[i].tickMin) {
            motors[i].tickMin = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}



function on_button_up(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickTarget += motors[i].polarity * 10;
        if (motors[i].tickTarget > motors[i].tickMax) {
            motors[i].tickMax = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_down(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickTarget += -motors[i].polarity * 10;
        if (motors[i].tickTarget < motors[i].tickMin) {
            motors[i].tickMin = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_top(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        if (motors[i].polarity == -1) {
            motors[i].tickMin = motors[i].tickTarget;
        } else {
            motors[i].tickMax = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_bottom(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        if (motors[i].polarity == -1) {
            motors[i].tickMax = motors[i].tickTarget;
        } else {
            motors[i].tickMin = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_snap_targets(evt) {
    robot.snapTargets();
}

function on_osc_event(data) {
    var command = data.address.split('_')[0];
    console.log("Got: " + command);
    switch (command) {
        case "/pos":
            var motors = robot.getMotorsByLabel(data.address.split('_')[1]);
            for (var i = motors.length - 1; i >= 0; i--) {
                motors[i].setActual(data.args[0]);
            };
            break;
    }
}
