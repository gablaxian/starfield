starfield
=========

Funky little script that creates a flickering starfield. Currently in use as the header for my site, (gablaxian.com)[http://gablaxian.com]

## Usage

Create a canvas element on your page with an id of 'starfield':

    <canvas id="starfield"></canvas>

Load in the script:
    
    <script src="starfield.js"></script>

Run it:

    <script>
        StarField();
    </script>

## Configuration

Currently, the starfield accepts a few options:

    StarField({
        width:          window.innerWidth
        height:         150
        star_density:   10  // Number of stars per 100x100 block, mathematically speaking. Positions are all random.
    })