function drawTop3(data){

    htmlIndicator = htmlIndicator + '<li data-target="#myCarousel" data-slide-to="0" class="active"></li>'

    var html = '';
    var htmlIndicator = '';
    var counter = 0;
    if(data.length > 0){
        for(var i=0 ; i<data.length ; i++){
            var active = '';
            if(i==0){
                active = 'active'
            }else{
                active = '';
            }
            htmlIndicator = htmlIndicator + '<li data-target="#myCarousel" data-slide-to="'+i+'" class="'+active+'"></li>'
            html = html + '<div class="item '+active+'">'
            html = html +     '<div class="container">'
            html = html +         '<div class="carousel-caption" hash="'+data[i]._id+'">'
            if(data[i].image.length > 0){
                html = html +             '<img src="'+data[i].image+'" class="header-img-click" align="left">'
            }
            html = html +             '<div class="header-content"><span>'+data[i].msg
            if(data[i].link && data[i].link.type == 'link'){
                html = html +               '<br><a href="'+data[i].link.url+'" target="_blank" >'+data[i].link.title+'</a>'
            }
            html = html +             '</span></div>'
            html = html +         '</div>'
            html = html +     '</div>'
            html = html + '</div>'
            counter++;
        }
    }else{
        html = html + '<div class="item active">'
        html = html +     '<div class="container">'
        html = html +         '<div class="carousel-caption">'
        html = html +             '<span>추천글이 없습니다</span>'
        html = html +         '</div>'
        html = html +     '</div>'
        html = html + '</div>'
    }

    $('.carousel-indicators').html('');
    $('.carousel-indicators').append(htmlIndicator);

    $('.carousel-inner').html('')
    $('.carousel-inner').append(html);
}

function drawTalks(data){

    var html = '<div class="wall">';
    for(var i=0 ; i<data.length ; i++){
        html = html + '<div class="box" id="'+data[i]._id+'">';
        html = html +     '<div class="message-wrapper">'
        html = html +         '<p>'+data[i].msg+'</p>'
        if(data[i].image.length > 0){
            html = html +     '<div><img class="message-img-click" src="'+data[i].image+'"></div>'
        }
        if(data[i].link && data[i].link.type == 'link'){
            html = html + '<div class="link" style="border-left: 8px solid '+getRandomColor()+'">'
            // html = html + '    <div class="link-provider">'
            // html = html + '        <img src="/img/provider.png">'+data[i].link.provider_name
            // html = html + '    </div>'
            html = html + '    <div class="link-thumbnail">'
            html = html + '        <img src="'+data[i].link.thumbnail_url+'" onload="initMasonry()">'
            html = html + '    </div>'
            html = html + '    <div class="link-title">'+data[i].link.title+'</div>'
            html = html + '    <div class="link-desc">'+data[i].link.description+'</div>'
            html = html + '    <div class="link-go"><a href="'+data[i].link.url+'" target="_blank" >'+data[i].link.provider_name+'에서 보기 ></a></div>'
            html = html + '</div>'
        }
        html = html +         '<div class="box-info">'
        html = html +             '<div class="box-date">'+getFormatDate(data[i].date)+'</div>'
        html = html +             '<div class="box-add-reply">댓글</div>'
        html = html +             '<div class="box-dislike">Bad <span>'+data[i].dislike+'</span></div>'
        html = html +             '<div class="box-like">Good <span>'+data[i].like+'</span></div>'
        html = html +         '</div>'
        html = html +     '</div>'
        html = html + drawReplies(data[i]);
        html = html + '</div>'
    }
    html = html + '</div>'

    $('.wall-outer').html('');
    $('.wall-outer').append(html);
}

function drawReplies(talk){

    var html = '';
    if(talk.replies){
        var count = 0;
        html = html + '<div class="reply-wrapper">'
        for(var i=0 ; i<talk.replies.length ; i++){
            var reply = talk.replies[i];
            html = html +     '<div class="reply-wrapper-each">'
            html = html +         '<div class="reply-header">+</div>'
            html = html +         '<div class="reply-content">'+reply.msg
            html = html +             '<div class="reply-date">'+getFormatDate(reply.date)+'</div>'
            html = html +         '</div>'
            html = html +     '</div>'
        }
        html = html + '</div>'
        // if(talk.replies.length > 2){
        //     html = html + '<div class="reply-wrapper-all">'
        //     for(var i=talk.replies.length-1 ; i>=0 ; i--){
        //         var reply = talk.replies[i];
        //         html = html +     '<div class="reply-wrapper-each">'
        //         html = html +         '<div class="reply-header">+</div>'
        //         html = html +         '<div class="reply-content">'+reply.msg
        //         html = html +             '<div class="reply-date">'+getFormatDate(reply.date)+'</div>'
        //         html = html +         '</div>'
        //         html = html +     '</div>'
        //     }
        //     html = html + '</div>'
        //     html = html + '<div class="reply-more arrow-down"></div>'
        // }
    }else{

    }
    return html;
}


var today = new Date();
function getFormatDate(date){
    var result = '';
    result = fillzero(date.month,2) + "-" + fillzero(date.day,2)
    // if(today.getFullYear() != date.year
    //     || (today.getMonth()+1) != date.month
    //     || today.getDate() != date.day){
    //     result = fillzero(date.month,2) + "-" + fillzero(date.day,2) + " ";
    // }
    // result = result + fillzero(date.hour,2) + ":" + fillzero(date.min,2);
    return result;
}

function fillzero(obj, len) {
    obj= '000000000000000'+obj;
    return obj.substring(obj.length-len);
}

function getRandomColor() {
    // var letters = '0123456789ABCDEF'.split('');
    var data = '23456789ABCDE';
    var letters = data.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * data.length)];
    }
    return color;
}
