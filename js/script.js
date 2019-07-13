'use strict';

// Déclaration des variables 

window.addEventListener("DOMContentLoaded", game);

// Image source de sprite 

var sprite = new Image();
var spriteExplosion = new Image();
sprite.src = './img/sprite.png';

window.onload = function() {
    spriteExplosion.src = './img/explosion.png';
};

// La compatibilité navigateurs

    window.requestAnimationFrame = (function(){
        return  window.requestAnimationFrame       ||
                    //Mozilla
                window.mozRequestAnimationFrame    ||
                    //Safari
                window.webkitRequestAnimationFrame    ||
                    //Autres navigateurs
                function (callback) {
                    setTimeout(callback, 1000/120)
                };
    })();

// Fonction de début du jeu au clique sur le bouton

window.addEventListener("load", function(){

  $('#container').css('visibility', 'visible');
    
    $('#play').click(function(){
    $('#canvas').css('display', 'block');
    
// Disparition des boutons
    
    $('#play').css('display', 'none');
    $('#instructions').css('display', 'none');
    $('#container').css('display', 'none');
    });    
});

// Fonction d'initialisation du canvas

function game() {

    //Canvas

    var canvas = document.getElementById('canvas'),
        ctx    = canvas.getContext('2d'),
        cH     = ctx.canvas.height = window.innerHeight,
        cW     = ctx.canvas.width  = window.innerWidth ;

    //Jeu
    var projectiles      = [],
        asteroids        = [],
        explosions       = [],
        asteroidDetruit  = 0,
        score            = 0,
        count            = 0,
        play             = false,
        gameOver         = false,
        _planet          = {deg: 0};

    //Joueur
    var player = {
        posX   : -35,
        posY   : -182,
        width  : 70,
        height : 79,
        deg    : 0
    };

    canvas.addEventListener('click', action);
    canvas.addEventListener('mousemove', action);
    window.addEventListener("resize", update);

    function update() {
        cH = ctx.canvas.height = window.innerHeight;
        cW = ctx.canvas.width  = window.innerWidth ;
    }

    function move(e) {
        player.deg = Math.atan2(e.offsetX - (cW/2), -(e.offsetY - (cH/2)));
    }

    function action(e) {
        e.preventDefault();
        if(play) {
            var projectile = {
                x: -8,
                y: -179,
                sizeX : 2,
                sizeY : 10,
                realX : e.offsetX,
                realY : e.offsetY,
                dirX  : e.offsetX,
                dirY  : e.offsetY,
                deg   : Math.atan2(e.offsetX - (cW/2), -(e.offsetY - (cH/2))),
                asteroidDetruit: false
            };

            projectiles.push(projectile);
        } else {
            var dist;
            if(gameOver) {
                dist = Math.sqrt(((e.offsetX - cW/2) * (e.offsetX - cW/2)) + ((e.offsetY - cH/2) * (e.offsetY - cH/2)));
                console.log(dist);
                if (dist < 27) {
                    if(e.type == 'click') {
                        gameOver = false;
                        play = true;
                        count      = 0;
                        projectiles = [];
                        asteroids  = [];
                        explosions = [];
                        asteroidDetruit = 0;
                        player.deg = 0;
                        canvas.removeEventListener("mousemove", action);
                        canvas.removeEventListener('contextmenu', action);
                        canvas.setAttribute("class", "playing");
                        canvas.style.cursor = "default";
                    } else {
                        canvas.style.cursor = "pointer";
                    }
                } else {
                    canvas.style.cursor = "default";
                }
            } else {
                dist = Math.sqrt(((e.offsetX - cW/2) * (e.offsetX - cW/2)) + ((e.offsetY - cH/2) * (e.offsetY - cH/2)));

                if (dist < 27) {
                    if(e.type == 'click') {
                        play = true;
                        canvas.removeEventListener("mousemove", action);
                        canvas.addEventListener('contextmenu', action);
                        canvas.addEventListener('mousemove', move);
                        canvas.setAttribute("class", "playing");
                        canvas.style.cursor = "default";
                    } else {
                        canvas.style.cursor = "pointer";
                    }
                } else {
                    canvas.style.cursor = "default";
                }
            }
        }
    }

    function fire() {
        var distance;

        for(var i = 0; i < projectiles.length; i++) {
            if(!projectiles[i].asteroidDetruit) {
                ctx.save();
                ctx.translate(cW/2,cH/2);
                ctx.rotate(projectiles[i].deg);

                ctx.drawImage(
                    sprite,
                    211,
                    100,
                    50,
                    75,
                    projectiles[i].x,
                    projectiles[i].y -= 20,
                    19,
                    30
                );

                ctx.restore();

                //Real coords
                projectiles[i].realX = (0) - (projectiles[i].y + 10) * Math.sin(projectiles[i].deg);
                projectiles[i].realY = (0) + (projectiles[i].y + 10) * Math.cos(projectiles[i].deg);

                projectiles[i].realX += cW/2;
                projectiles[i].realY += cH/2;

                //Collision
                for(var j = 0; j < asteroids.length; j++) {
                    if(!asteroids[j].asteroidDetruit) {
                        distance = Math.sqrt(Math.pow(
                                asteroids[j].realX - projectiles[i].realX, 2) +
                            Math.pow(asteroids[j].realY - projectiles[i].realY, 2)
                        );

                        if (distance < (((asteroids[j].width/asteroids[j].size) / 2) - 4) + ((19 / 2) - 4)) {
                            asteroidDetruit += 1;
                            asteroids[j].asteroidDetruit = true;
                            projectiles[i].asteroidDetruit   = true;
                            explosions.push(asteroids[j]);
                        }
                    }
                }
            }
        }
    }

    function planet() {
        ctx.save();
        ctx.fillStyle   = 'white';
        ctx.shadowBlur    = 100;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor   = "#999";

        ctx.arc(
            (cW/2),
            (cH/2),
            100,
            0,
            Math.PI * 2
        );
        ctx.fill();

        //Rotation de la planet
        ctx.translate(cW/2,cH/2);
        ctx.rotate((_planet.deg += 0.1) * (Math.PI / 180));
        ctx.drawImage(sprite, 0, 0, 200, 200, -100, -100, 200,200);
        ctx.restore();
    }

    function _player() {

        ctx.save();
        ctx.translate(cW/2,cH/2);

        ctx.rotate(player.deg);
        ctx.drawImage(
            sprite,
            200,
            0,
            player.width,
            player.height,
            player.posX,
            player.posY,
            player.width,
            player.height
        );

        ctx.restore();

        if(projectiles.length - asteroidDetruit && play) {
            fire();
        }
    }

    function newAsteroid() {

        var type = random(1,4),
            coordsX,
            coordsY;

        switch(type){
            case 1:
                coordsX = random(0, cW);
                coordsY = 0 - 150;
                break;
            case 2:
                coordsX = cW + 150;
                coordsY = random(0, cH);
                break;
            case 3:
                coordsX = random(0, cW);
                coordsY = cH + 150;
                break;
            case 4:
                coordsX = 0 - 150;
                coordsY = random(0, cH);
                break;
        }

        var asteroid = {
            x: 278,
            y: 0,
            state: 0,
            stateX: 0,
            width: 134,
            height: 123,
            realX: coordsX,
            realY: coordsY,
            moveY: 0,
            coordsX: coordsX,
            coordsY: coordsY,
            size: random(1, 3),
            deg: Math.atan2(coordsX  - (cW/2), -(coordsY - (cH/2))),
            asteroidDetruit: false
        };
        asteroids.push(asteroid);
    }

    function _asteroids() {
        var distance;

        for(var i = 0; i < asteroids.length; i++) {
            if (!asteroids[i].asteroidDetruit) {
                ctx.save();
                ctx.translate(asteroids[i].coordsX, asteroids[i].coordsY);
                ctx.rotate(asteroids[i].deg);

                ctx.drawImage(
                    sprite,
                    asteroids[i].x,
                    asteroids[i].y,
                    asteroids[i].width,
                    asteroids[i].height,
                    -(asteroids[i].width / asteroids[i].size) / 2,
                    asteroids[i].moveY += 1/(asteroids[i].size),
                    asteroids[i].width / asteroids[i].size,
                    asteroids[i].height / asteroids[i].size
                );

                ctx.restore();

                //Real Coords
                asteroids[i].realX = (0) - (asteroids[i].moveY + ((asteroids[i].height / asteroids[i].size)/2)) * Math.sin(asteroids[i].deg);
                asteroids[i].realY = (0) + (asteroids[i].moveY + ((asteroids[i].height / asteroids[i].size)/2)) * Math.cos(asteroids[i].deg);

                asteroids[i].realX += asteroids[i].coordsX;
                asteroids[i].realY += asteroids[i].coordsY;

                //Game over
                distance = Math.sqrt(Math.pow(asteroids[i].realX -  cW/2, 2) + Math.pow(asteroids[i].realY - cH/2, 2));
                if (distance < (((asteroids[i].width/asteroids[i].size) / 2) - 4) + 100) {
                    gameOver = true;
                    play  = false;
                    canvas.addEventListener('mousemove', action);
                }
            } else if(!asteroids[i].extinct) {
                explosion(asteroids[i]);
            }
        }

        if(asteroids.length - asteroidDetruit < 10 + (Math.floor(asteroidDetruit/6))) {
            newAsteroid();
        }
    }

    function explosion(asteroid) {
        ctx.save();
        ctx.translate(asteroid.realX, asteroid.realY);
        ctx.rotate(asteroid.deg);

        var spriteY,
            spriteX = 256;
        if(asteroid.state == 0) {
            spriteY = 0;
            spriteX = 0;
        } else if (asteroid.state < 8) {
            spriteY = 0;
        } else if(asteroid.state < 16) {
            spriteY = 256;
        } else if(asteroid.state < 24) {
            spriteY = 512;
        } else {
            spriteY = 768;
        }

        if(asteroid.state == 8 || asteroid.state == 16 || asteroid.state == 24) {
            asteroid.stateX = 0;
        }

        ctx.drawImage(
            spriteExplosion,
            asteroid.stateX += spriteX,
            spriteY,
            256,
            256,
            - (asteroid.width / asteroid.size)/2,
            -(asteroid.height / asteroid.size)/2,
            asteroid.width / asteroid.size,
            asteroid.height / asteroid.size
        );
        asteroid.state += 1;

        if(asteroid.state == 31) {
            asteroid.extinct = true;
        }

        ctx.restore();
    }

    function start() {
        if(!gameOver) {
            //Clear
            ctx.clearRect(0, 0, cW, cH);
            ctx.beginPath();

            //Planet
            planet();

            //Player
            _player();

            if(play && asteroidDetruit < 250) {
                _asteroids();

                ctx.font = "20px Verdana";
                ctx.fillStyle = "lime";
                ctx.textBaseline = 'middle';
                ctx.textAlign = "left";
                ctx.fillText('Score: ' + asteroidDetruit + ' /250', 20, 30);
         
            } else if(asteroidDetruit == 250){

                asteroids.length = 0;
                $('#win').css('display', 'block');
                $('#container').css('display', 'block');
                $('#game').css('display', 'none');

            }else {
                ctx.drawImage(sprite, 428, 10, 80, 80, cW/2 - 35, cH/2 - 35, 80,80);
            }
        } else if(count < 1) {
            count = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.rect(0,0, cW,cH);
            ctx.fill();

            ctx.font = "35px Verdana";
            ctx.fillStyle = "lime";
            ctx.textBaseline = 'middle';
            ctx.textAlign = "center";
            ctx.fillText("VOUS AVEZ PERDU !", cW/2, cH/2 - 180);
            ctx.fillText("Cliquez sur replay pour rejouer", cW/2, cH/2 + 180);

            ctx.drawImage(sprite, 506, 10, 80, 80, cW/2 - 35, cH/2 - 35, 80,80);

            canvas.removeAttribute('class');
        }
    }

    function init() {
        window.requestAnimationFrame(init);
        start();
    }

    init();

   document.getElementById('win').addEventListener('click', function() {
                
            ctx.clearRect(0, 0, cW, cH);
               
            init();
           
    });

    //Utils
    function random(from, to) {
        return Math.floor(Math.random() * (to - from + 1)) + from;
    }

}