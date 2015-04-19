
var StarField = function(element, options) {
    "use strict"

    var options         = options || {},
        canvas          = element || (document.querySelector('#starfield') || document.querySelector('.starfield')),
        context         = canvas.getContext('2d'),
        canvas_width    = options.width     || window.innerWidth,
        canvas_height   = options.height    || 80,
        scrollY         = 0,
        paused          = false,
        star_density    = options.star_density || 10,
        speed           = options.speed || 6,
        background_stars = new Array(),
        flickering_stars = new Array(),
        stars_length    = 0;


    // It was nice to play around with requestAnimationFrame, but honestly, for a starfield, 60fps isn't necessary and only used more CPU power.
    // I also don't like the idea of having to add more code and time calculations simply to _reduce_ the frame rate.
    // We're not doing critical animation here, and it doesn't matter if timing isnt exact. By dropping back to setTimeout and 24fps, overall CPU
    // usage has reduced to around 10%, almost half of before.
    // Once you move off the tab, you won't get the CPU savings of RAF, but we're still checking the animation is in view when on the page and pausing accordingly.
    // window.requestAnimFrame = (function(){
    //     return  function( callback ){
    //                 window.setTimeout(callback, 1000 / 24);
    //             };
    // })();

    /**
        init
    **/
    function init() {

        // Does the browser support local storage? We can use it to speed up subsequent page loads by skipping the star array generation
        // and also keep star position consistent between pages. It's the little things.
        if( localStorage.getItem('background_stars') ) {
            background_stars = JSON.parse( localStorage.getItem('background_stars') );
            flickering_stars = JSON.parse( localStorage.getItem('flickering_stars') );

            stars_length = flickering_stars.length;
        }
        else {
            generate_stars();
        }

        populateStarfield();

        // Events
        window.addEventListener( 'resize', onWindowResize );
        window.addEventListener( 'scroll', onScroll );

        // Start the animation!
        animate();
    }

    /**
        generate_stars

        Setup the stars
        Two types.
        1. Background stars. Static, dark grey (between 0.1 - 0.5 transparency)
        2. Flickering. Set up an array of randomly placed stars with random opacities.
    **/
    function generate_stars() {
        "use asm"

        // number of stars is determined by a star density. Break up the canvas into a grid of 100x100px. Density is the number of stars per block. So, parts per thousand, effectively.
        var number_of_stars = (Math.round(canvas_width / 100) * (canvas_height / 100).toFixed(1)) * star_density;

        // Reset the arrays, otherwise during window resizing it keeps pushing more stars onto the array instead of just being the newly calculated number of stars.
        background_stars = [];
        flickering_stars = [];

        // Setup the star arrays
        for (var i = 0; i < number_of_stars; i++) {
            // for the background stars, don't bother with opacity, instead we want a 'brightness' between full black and half-white (0-128) value.
            background_stars.push( { x: Math.round(Math.random() * canvas_width), y: Math.round(Math.random() * canvas_height), w: ( Math.random() < 0.5 ? 2 : 1 ), b: Math.round(Math.random() * 128) } );
            flickering_stars.push( { x: Math.round(Math.random() * canvas_width), y: Math.round(Math.random() * canvas_height), w: ( Math.random() < 0.5 ? 2 : 1 ), b: Math.round(Math.random() * 255), s: ( Math.random() < 0.5 ? 0 : 1 ) } );
        }

        localStorage.setItem('background_stars', JSON.stringify(background_stars));
        localStorage.setItem('flickering_stars', JSON.stringify(flickering_stars));

        stars_length = flickering_stars.length;
    }

    function populateStarfield() {
        canvas.width    = canvas_width;
        canvas.height   = canvas_height;

        // set up the bg and static stars
        // set the black BG
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas_width, canvas_height);

        var l = background_stars.length,
            i = 0;
        
        /* Just one loop */
        for (; i < l; i++) {
            context.fillStyle = 'rgb('+background_stars[i].b+','+background_stars[i].b+','+background_stars[i].b+')';
            context.fillRect(background_stars[i].x, background_stars[i].y, 2, 2);
        }
    }

    function onWindowResize() {
        // Only re-init on a width change.
        if( window.innerWidth != canvas_width ) {
            canvas_width = window.innerWidth;

            generate_stars();
            populateStarfield();
        }
    }

    function onScroll() {
        scrollY = window.pageYOffset;

        if( scrollY > canvas_height )
            paused = true;
        else
            paused = false;
    }

    function animate() {
        if( !paused )
            render();

        window.setTimeout(animate, 1000 / 24);
    }

    function render() {

        /*  
            For flickering stars, on each loop increase the opacity by 0.1 until fully opaque then back to fully transparent. When fully transparent, set to a new random position
        */

        // draw stars
        var i = stars_length;
        
        /* Just one loop */
        while (i--) {
        
            // Flickering stars
            var star = flickering_stars[i];

            // if the star is glowing
            if (star.s == 1) {
                if(star.b < 255)
                    star.b += speed;
                else {
                    star.s = 0;
                    star.b -= speed;
                }
            }
            else {
                if(star.b > 55)
                    star.b -= speed;
                else {
                    star.s = 1;
                    star.b += speed;
                }
            }

            // clear only the areas where stars appear. Just paint the affected area black.
            context.fillStyle = 'rgb('+star.b+','+star.b+','+star.b+')';
            context.fillRect(star.x, star.y, star.w, star.w);
        };
    }

    init();
}

StarField();
