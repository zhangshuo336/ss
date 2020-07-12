$(function(){
    // 页面加载渲染所有的视频简略
    !function(){
        $.ajax({
            type:'get',
            dataType:'json',
            url:"/video/video_list",
            success:function(data){
                console.log(data)
                if(data.ret == 0){
                    let html = ""
                    data.dir_info.forEach(function(item){
                        html += '<div class="thumbnail" data-name="'+item.name+'" data-src-path="'+item.src_path+'" data-path="'+item.path+'">';
                        html += '<div class="thumbnail-image">';
                        html += '<img src="/static/img/d1559035ee7b15743757d7e483d5934b.jpg">';
                        // html += '<video src="/static/media/video/'+item.name+'" controls width="200" height="180"></video>'
                        html += '</div>';
                        html += '<div class="thumbnail-name">'+item.name+'</div>';
                        html += '</div>';
                    })
                    $(".video-frame").html(html);
                }
                else{
                    console.log(data.err);
                }
            }
        })

    }();

// 视频简略点击效果
    $(".video-frame").on("click",".thumbnail",function(){
        let path = $(this).attr("data-path");
        let name = $(this).attr("data-name");
        window.open("/video/video_detail/?path="+path,"")
    });
 
   

});