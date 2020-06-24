//serialize START
/* vanilla.js first
    FirstWay: 0.98193359375ms
    SecondWay: 0.3369140625ms
*/
/* Jquery first
    FirstWay: 1.63818359375ms
    SecondWay: 0.595703125ms
*/

/* vanilla.js first
    FirstWay: 0.1240234375ms
    SecondWay: 0.14404296875ms
*/
/* Jquery first
    FirstWay: 0.191162109375ms
    SecondWay: 0.295166015625ms
*/

wk(document).on('click', '.element', (event) => {
    console.time('FirstWay');
        var data = wk('#save-me').serializeArray();
    console.timeEnd('FirstWay');
    console.time('SecondWay');
        var dataS = wk('#save-me').serialize();
    console.timeEnd('SecondWay');
});
$(document).on('click', '.element', (event) => {
    console.time('FirstWay');
        var data = $('#save-me').serializeArray();
    console.timeEnd('FirstWay');
    console.time('SecondWay');
        var dataS = $('#save-me').serialize();
    console.timeEnd('SecondWay');
});

//serialize END
