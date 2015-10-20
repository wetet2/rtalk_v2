function init() {

    $('.box-add-reply').click(function() {
        var id = $(this).closest('.box').attr('id')
        $('#inputId').val(id);
        $('#inputTextOri').val('@reply:');
        $('#inputTextOri').focus();

    });

    $('.header-img-click').click(function(e) {
        var imgUrl = $(this).attr('src');
        window.open(imgUrl);
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
        $('.wall').masonry();
    })

    initMasonry();
    // startRefreshTimer();
    // startReloadTimer();
}

function startReloadTimer() {
    setInterval(function() {
        window.location.reload();
    }, 64 * 1000);
}
var refreshTimer;

function startRefreshTimer() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    refreshTimer = setInterval(function() {
        refresh();
    }, 15 * 1000);
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
            init();
        },
        error: function(e) {
            console.error(e);
        }
    });
}

function rearrangeMasonry() {
    $('.wall').masonry();
}

function initMasonry() {
    var option = {
        itemSelector: '.box',
        percentPosition: true,
        gutter: 15,
        animate: true,
        animationOptions: {
            duration: 700,
            queue: true,
        }
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

    var submitOpts = { target: '#formSave', success: afterSubmit}

    Autolinker.prototype.twitter = false;
    $('#myCarousel').carousel({
        interval: 0
    });



    $('#divTitle').click(function() {
        refresh();
    });

    $('#btnGo').click(function() {
        var msg = $('#inputTextOri').val();
        if(msg.trim().length == 0 && $('#inputImage').length == 0){
            return false;
        }
        msg = Autolinker.link(msg, {
            truncate: 15,
            stripPrefix: true
        });
        $('#inputText').val(msg);

        if ($('#inputImage').val() == '') {
            $('#inputImage').remove();
        }

        $('form').submit()

    })

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
