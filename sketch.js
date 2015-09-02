var canvas;
var socket;
var Motor = function(boardId, boardPortId, min, max) {
    this.boardId = boardId;
    this.boardPortId = boardPortId;
    this.tickMax = max;
    this.tickMin = min;
    this.tickCurrent = floor(random(this.tickMax));
    this.tickTarget = this.tickCurrent;
    this.tickActual = this.tickCurrent;
    this.positionX = 40;
    this.positionY = 40;
    this.moving = false;
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
    if (this.tickActual > this.tickMax) {
        this.tickMax = this.tickActual;
    }
    if (this.tickActual < this.tickMin) {
        this.tickMin = this.tickActual;
    }

}

Motor.prototype.draw = function(x, y) {
    push();
    fill('rgb(0,0,0)');
    translate(x, y);
    line(0, 0, 0, 500);
    text(this.tickMin, -textWidth(this.tickMin) / 2, -20);
    ellipse(0, map(this.tickCurrent, this.tickMin, this.tickMax, 0, 500), 20, 20);
    line(-20, map(this.tickActual, this.tickMin, this.tickMax, 0, 500), 20, map(this.tickActual, this.tickMin, this.tickMax, 0, 500));

    text(floor(this.tickCurrent), -textWidth(floor(this.tickCurrent)) / 2, map(this.tickCurrent, this.tickMin, this.tickMax, 0, 500) - 20)
    text(this.tickMax, -textWidth(this.tickMax) / 2, 520);
    text(this.label(), -textWidth(this.label()) / 2, 540);
    text(this.tickActual, -textWidth(this.tickActual) / 2, 560);
    fill('rgb(0,255,0)');
    ellipse(0, map(this.tickTarget, this.tickMin, this.tickMax, 0, 500), 10, 10);

    pop();
}

Motor.prototype.move = function() {
    this.tickCurrent = lerp(this.tickCurrent, this.tickTarget, .04);
    socket.emit('osc',[this.boardId, this.boardPortId, this.tickCurrent]);
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
    label = createElement('p', motor.label());
    label.position(windowWidth / 2, 50 + (30 * this.motors.length));
    label.elt.style.float = "right";
    label.elt.style.margin = 0;
    b = createButton("d", motor.label());
    b.position(windowWidth / 2 + 30, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_d);

    b = createButton("u", motor.label());
    b.position(windowWidth / 2 + 60, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_u);

    b = createButton("min", motor.label());
    b.position(windowWidth / 2 + 90, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_min);

    b = createButton("max", motor.label());
    b.position(windowWidth / 2 + 120, 50 + (30 * this.motors.length));
    b.mousePressed(on_button_max);
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
    robot.addMotor(new Motor(1, "A", 0, 1000));
    robot.addMotor(new Motor(1, "B", 0, 1000));
    robot.addMotor(new Motor(2, "A", 0, 1000));
    robot.addMotor(new Motor(2, "B", 0, 1000));
    robot.addMotor(new Motor(3, "A", 0, 1000));
    robot.addMotor(new Motor(3, "B", 0, 1000));
    robot.addMotor(new Motor(4, "A", 0, 1000));
    robot.addMotor(new Motor(4, "B", 0, 1000));
    robot.addMotor(new Motor(5, "A", 0, 1000));
    robot.addMotor(new Motor(5, "B", 0, 1000));
    robot.addMotor(new Motor(6, "A", 0, 1000));
    robot.addMotor(new Motor(6, "B", 0, 1000));
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

function on_button_u(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickTarget += 10;
        if (motors[i].tickTarget > motors[i].tickMax) {
            motors[i].tickMax = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_d(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickTarget -= 10;
        if (motors[i].tickTarget < motors[i].tickMin) {
            motors[i].tickMin = motors[i].tickTarget;
        }
    };
    console.log(evt.target.value);
}

function on_button_min(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickMin = motors[i].tickTarget;
    };
    console.log(evt.target.value);
}

function on_button_max(evt) {
    motors = robot.getMotorsByLabel(evt.target.value);
    for (var i = motors.length - 1; i >= 0; i--) {
        motors[i].tickMax = motors[i].tickTarget;
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