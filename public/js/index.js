var embedly_url = 'http://api.embed.ly/1/oembed?key=7b28441e2d01480596aac70e57ab9f79&url='
var onProcessing = false;

var carouselInterval = 10000;
var refreshInteval = 120;
function startReloadTimer() {
    setTimeout(function(){
        window.location.reload();
    }, refreshInteval * 1000)
}

function init() {

    // alert($(window).height());

    $('.box-add-reply').click(function() {
        var id = $(this).closest('.box').attr('id')
        $('#inputId').val(id);
        $('#inputTextOri').val('@reply:');
        $('#inputTextOri').focus();

    });

    $('.header-img-click').click(function(e) {
        // var boxId = $(this).closest('.carousel-caption').attr('hash');
        // window.location.href='/#'+boxId;
        var src = $(this).attr('src');
        window.open(src,'_blank');
    })

    $('.message-img-click').click(function(e) {
        var imgUrl = $(this).attr('src');
        window.open(imgUrl);
    })

    // $('.reply-more').unbind();
    $('.reply-more').click(function(e) {
        var more = $(this);
        var replyShort = more.closest('.box').children('.reply-wrapper');
        var replyAll = more.closest('.box').children('.reply-wrapper-all');

        if (replyShort.css('display') == 'none') {
            replyAll.animate({
                height: 'toggle'
            }, function() {
                replyShort.animate({
                    height: 'toggle'
                }, function() {
                    more.removeClass('arrow-up').addClass('arrow-down');
                    rearrangeMasonry();
                });
            });
            // replyShort.css('display', 'inherit');
            // replyAll.css('display', 'none');
            // more.removeClass('arrow-up').addClass('arrow-down');
        } else {
            replyShort.animate({
                height: 'toggle'
            }, function() {
                replyAll.animate({
                    height: 'toggle'
                }, function() {
                    more.removeClass('arrow-down').addClass('arrow-up');
                    rearrangeMasonry();
                });
            });
            // replyAll.css('display', 'inherit');
            // replyShort.css('display', 'none');
            // more.removeClass('arrow-down').addClass('arrow-up');
        }
        // refresh();
    })

    var canLike = true;
    $('.box-like').click(function() {
        var count = $(this).children('span');
        if (canLike) {
            canLike = false;

            setTimeout(function() {
                canLike = true
            }, 3000);

            $.ajax({
                type: 'post',
                contentType: 'application/json',
                url: '/like',
                data: JSON.stringify({
                    id: $(this).closest('.box').attr('id')
                }),
                success: function(data) {
                    count.html(data.like);
                },
                error: function(e) {
                    console.error(e);
                }
            });
        }

    });

    var canDislike = true;
    $('.box-dislike').click(function() {
        var count = $(this).children('span');
        if (canDislike) {
            canDislike = false;
            $.ajax({
                type: 'post',
                contentType: 'application/json',
                url: '/dislike',
                data: JSON.stringify({
                    id: $(this).closest('.box').attr('id')
                }),
                success: function(data) {
                    count.html(data.dislike);
                },
                error: function(e) {
                    console.error(e);
                }
            });
        }
        setTimeout(function() {
            canDislike = true
        }, 3000);
    });

    $('.box img').load(function() {
        initMasonry();
    })

    initMasonry();

}


function refresh(isFirst) {
    $.ajax({
        type: 'post',
        contentType: 'application/json',
        url: '/getTalks',
        success: function(data) {
            if (isFirst) {
                drawTop3(data.top3);
            }
            drawTalks(data.all);
            try{
                init();
            }catch(err){
            }
        },
        error: function(e) {
            console.error(e);
        },
        complete: function(e){
            startReloadTimer();
        }
    });
}

function rearrangeMasonry() {
    $('.wall').masonry();
}

function initMasonry() {
    var option = {
        itemSelector: '.box',
        percentPosition: true
        // gutter: 30,
        // animate: true,
        // animationOptions: {
        //     duration: 700,
        //     queue: true,
        // }
    };
    $('.wall').masonry(option);
}

function showAttachedImageIcon(yn) {
    if (yn) {
        $('.attached-image').css('display', 'initial');
        $('.attached-image').css('cursor', 'pointer');
    } else {
        $('.attached-image').css('display', 'none');
        $('.attached-image').css('cursor', 'pointer');
    }
}

$(function() {
    // alert($(window).width()+':'+$(window).height());
    var submitOpts = { target: '#formSave', success: afterSubmit}

    Autolinker.prototype.twitter = false;
    $('#myCarousel').carousel({
        interval: carouselInterval
    });



    $('#divTitle').click(function() {
        window.location.reload();
    });

    $('#btnGo').click(function() {
        if(!onProcessing){
            changeButtonImage(1);
            onProcessing = true;
            var msg = $('#inputTextOri').val();
            if(msg.trim().length == 0 && $('#inputImage').length == 0){
                changeButtonImage(0);
                return false;
            }

            if(msg.indexOf('@reply:') === 0){
                var validation = msg.trim().replace('@reply:','');
                if(validation.trim().length == 0){
                    changeButtonImage(0);
                    return false;
                }
            }

            var link = Autolinker.onlyLink(msg);
            if(link && link != ''){
                $.ajax({

                    type: 'get',
                    contentType: 'application/json',
                    url: embedly_url + escape(link),
                    success: function(data) {
                        if(data.type == 'link' || data.type == 'video'){
                            delete data['thumbnail_height'];
                            delete data['thumbnail_width'];
                            delete data['version'];
                            delete data['author_url'];
                            delete data['author_name'];
                            delete data['height'];
                            delete data['width'];
                            if(data.description && data.description.length > 100){
                                data.description = data.description.substring(0,100)+'...';
                            }
                            if(data.html){
                                data.html = data.html.replace('allowfullscreen','');
                            }
                            $('#inputLinkInfo').val(JSON.stringify(data));
                            submit(msg.replace(link, ''));
                            $('#inputLinkInfo').val('');
                        }
                        // else if(data.type == 'video'){
                        //     delete data['thumbnail_height'];
                        //     delete data['thumbnail_width'];
                        //     delete data['version'];
                        //
                        // }
                        else{
                            normalSubmit(msg);
                        }
                    },
                    error: function(e) {
                        console.log(JSON.stringify(e));
                        normalSubmit(msg);
                    }
                });
            }else{
                normalSubmit(msg);
            }
        }

    });

    function changeButtonImage(image){
        if(image == 1){
            $('#btnGo img').attr('src','/img/loading.png');
        }else{
            $('#btnGo img').attr('src','/img/write.png');
        }
    }

    function normalSubmit(msg){
        msg = Autolinker.link(msg, {
            truncate: 15,
            stripPrefix: true
        });
        submit(msg);
    }

    function submit(msg){
        $('#inputText').val(msg);
        if ($('#inputImage').val() == '') {
            $('#inputImage').remove();
        }
        $('form').submit();
        onProcessing = false;
    }

    function afterSubmit(res){
        console.log('afterSubmit');
    }

    $('#btnImage').click(function() {
        if ($('#inputImage').length == 0) {
            $('<input/>', {
                    id: 'inputImage',
                    name: 'inputImage',
                    type: 'file',
                    accept: 'image/*',
                }).appendTo('form')
                .change(function(e) {
                    showAttachedImageIcon(true);
                    $('.attached-image').click(function() {
                        if (confirm('첨부된 이미지를 삭제합니다')) {
                            showAttachedImageIcon(false);
                            $('#inputImage').remove();
                        }
                    })
                });
        }
        $('#inputImage').click();
    });

    $('#inputTextOri').keydown(function(e) {
        if (e.keyCode === 13) {
            $('#btnGo').click();
        }
    });

    $(window).scroll(function() {
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            // alert('The end');
        }
    })

    refresh(true);

})
