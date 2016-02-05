var embedly_url = 'http://api.embed.ly/1/oembed?key=7b28441e2d01480596aac70e57ab9f79&url='
var onProcessing = false;

var carouselInterval = 10000;
var refreshInteval = 120;
function startReloadTimer() {
    if(auto_refresh){
        setTimeout(function(){
            window.location.reload();
        }, refreshInteval * 1000)
    }
}

function init() {

    //alert($(window).height());
    // alert($(window).width());

    $('.box-add-reply').click(function() {
        var id = $(this).closest('.box').attr('id')
        $('#inputId').val(id);
        $('#inputTextOri').val('@reply:');
        $('#inputTextOri').focus();

    });

    $('.header-img-click').click(function(e) {
        var src = $(this).attr('src');
        window.open(src,'_blank');
    })

    $('.message-img-click').click(function(e) {
        var imgUrl = $(this).attr('src');
        window.open(imgUrl);
    })

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

    var surItemClick = false;
    $('.sur-item').click(function() {
        if(surItemClick == false){
            surItemClick = true;
            clickSurveyItem($(this));
            setTimeout(function(){
                surItemClick = false;
            }, 3000)
        }
    });

    $('.sur-box').each(function(index){

        var surItemHeight  = getSurItemMaxHeight(this);
        $(this).children('.sur-item').each(function(index){
            $(this).children('.sur-item-back').css('height',surItemHeight);
            $(this).children('.sur-item-select').css('height',surItemHeight);
            $(this).css('height',surItemHeight);
        });


    });

    function getSurItemMaxHeight(box){
        var maxHeight = 0;
        $(box).children('.sur-item').each(function(index){
            var height = $(this).children('.sur-item-content').children('.sur-item-content-text').outerHeight()
            if(maxHeight < height){
                maxHeight = height;
            }
        });
        return maxHeight;
    }

    makeEventSurItemRemove();

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
            initSurveyResult();
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

function clickSurveyItem(surItem){
    var surBox = surItem.parent();
    var total = Number(surBox.attr('total'));
    surBox.attr('total',total + 1);
    var itemCnt = Number(surItem.children('.sur-item-content').children('.sur-item-content-per').text());
    surItem.children('.sur-item-content').children('.sur-item-content-per').text(itemCnt + 1);

    $.ajax({
        type: 'post',
        contentType: 'application/json',
        url: '/survey',
        data: JSON.stringify({
            id: surItem.closest('.box').attr('id'),
            itemId: surItem.attr('id')
        }),
        success: function(data) {
        },
        error: function(e) {
            console.error(e);
        },
        complete: function(){
            showSurveyResult(surBox, 200);
        }
    });


}

function initSurveyResult(){
    $('.sur-box').each(function(index){
        showSurveyResult($(this), 1000);
    });
}

function showSurveyResult(surBox, duration){

    var total = Number(surBox.attr('total'));
    surBox.children().each(function(index){

        var itemCnt = Number($(this).children('.sur-item-content').children('.sur-item-content-per').text());
        var percent = itemCnt * 100 / total;
        if(percent >100){
            alert('test');
        }

        $(this).children('.sur-item-back').css('background','#044479');
        $(this).children('.sur-item-content').children('.sur-item-content-text').css('color','#fcfcfc');
        $(this).children('.sur-item-content').children('.sur-item-content-per').css('display','inherit');
        $(this).children('.sur-item-select').animate({ width: percent+'%' }, duration);
    });

}

function openSurveyPopup(){
    $('#surveyPop').modal({backdrop:'static'});
}

$(function() {
    // alert($(window).width()+':'+$(window).height());

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

            var isReply = false;
            if(msg.indexOf('@reply:') === 0){
                isReply = true;
                var validation = msg.trim().replace('@reply:','');
                if(validation.trim().length == 0){
                    changeButtonImage(0);
                    return false;
                }
            }else if(msg.toLowerCase().indexOf('@survey') === 0){
                changeButtonImage(0);
                openSurveyPopup();
                return;
            }

            var link = Autolinker.onlyLink(msg);
            if(link && link != '' && !isReply){
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

    $('.survey-btn').click(function() {
        openSurveyPopup();
    });

    function changeButtonImage(image){
        if(image == 1){
            $('#btnGo img').attr('src','/img/loading.png');
        }else{
            onProcessing = false;
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
