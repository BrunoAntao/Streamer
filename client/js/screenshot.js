function getWidth() {

    return Math.max(

        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth

    );

}

function getHeight() {

    return Math.max(

        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight

    );

}

let screenshot = () => {

    let canvas = document.createElement('canvas');
    canvas.width = getWidth();
    canvas.height = getHeight();

    let ctx = canvas.getContext('2d');

    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
        '<foreignObject width="100%" height="100%">' +
        + '<p>yo man</p>' +
        '</foreignObject>' +
        '</svg>';

    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob([data], {
        type: 'image/svg+xml;charset=utf-8'
    });
    var url = DOMURL.createObjectURL(svg);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
    }

    img.src = url;

    return canvas.toDataURL();

}