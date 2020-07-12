var media_type;
var fileMd5;
var fileSuffix;
var $list=$("#thelist table>tbody");
var state = 'pending';//初始按钮状态
var $btn=$("#btn");
var count=0;
var map=new HashMap();
token = $("input[name=csrfmiddlewaretiken]").val();

function uploadfile(type){
    media_type = type
    let title;
    if(type == 'video'){
        title = '上传视频'
    }
    else if(type == 'audio'){
        title = '上传音频'
    }
    else if(type == 'text'){
        title = "上传文本"
    }
    else{
        title = '上传文件'
    }
    $("#exampleModalCenterTitle").html(title)
}
    
    //监听分块上传过程中的三个时间点
    WebUploader.Uploader.register({
        "before-send-file" : "beforeSendFile",
        "before-send" : "beforeSend",
        "after-send-file" : "afterSendFile",
    }, {
        //时间点1：所有分块进行上传之前调用此函数
        beforeSendFile : function(file) { 
            var deferred = WebUploader.Deferred();
            //1、计算文件的唯一标记，用于断点续传
            // (new WebUploader.Uploader()).md5File(file, 0, 10 * 1024 * 1024)
            (new WebUploader.Uploader()).md5File(file, 0, 1024)
                    .progress(function(percentage) {
                        $('#' + file.id).find("td.state").text("正在读取文件信息...");
                    }).then(function(val) {
                        fileMd5 = val;
                        $('#' + file.id).find("td.state").text("成功获取文件信息...");
                        //获取文件信息后进入下一步
                        deferred.resolve();
                    });
            return deferred.promise();
        },
        //时间点2：如果有分块上传，则每个分块上传之前调用此函数
        beforeSend : function(block) {
            var deferred = WebUploader.Deferred();

            $.ajax({
                type : "POST",
                url : "/upload/checkChunk/",
                data : {
                    //文件唯一标记
                    fileMd5 : fileMd5,
                    //当前分块下标
                    chunk : block.chunk,
                    //当前分块大小
                    chunkSize : block.end - block.start,
                    // 上传文件类型
                    media_type : media_type,
                },
                dataType : "json",
                success : function(response) {
                    if (response.ifExist) {
                        //分块存在，跳过
                        deferred.reject();
                    } else {
                        //分块不存在或不完整，重新发送该分块内容
                        deferred.resolve();
                    }
                }
            });

            this.owner.options.formData.fileMd5 = fileMd5;
            this.owner.options.formData.media_type = media_type;
            deferred.resolve();
            return deferred.promise();
        },
        //时间点3：所有分块上传成功后调用此函数
        afterSendFile : function(file) {
            //如果分块上传成功，则通知后台合并分块
            $.ajax({
                type : "POST",
                url : "/upload/mergeChunks/",
                data : {
                    fileId : file.id,
                    fileMd5 : fileMd5,
                    fileSuffix : fileSuffix,
                    fileName : file.name,
                    media_type : media_type
                },
                success : function(response) {
                    console.log(response.fileName+" 上传成功")
                    $('#del'+file.id).hide();
                }
            });
        }
    });

    var uploader = WebUploader.create({
                // swf文件路径
                swf : '/static/Uploader.swf',
                // 文件接收服务端。
                server : "/upload/upload/",
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick : {
                    id : '#picker',//这个id是你要点击上传文件的id
                    multiple : true
                },
                // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                resize : true,
                auto : false,
                //开启分片上传
                chunked : true,
                chunkSize : 10 * 1024 * 1024,

                accept : {
                    extensions : "txt,jpg,jpeg,bmp,png,zip,rar,war,pdf,cebx,doc,docx,ppt,pptx,xls,xlsx,iso,flv,mp4,mp3,tar,gz",
                    mimeTypes : '.txt,.jpg,.jpeg,.bmp,.png,.zip,.rar,.war,.pdf,.cebx,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.iso,.flv,.mp4,.mp3,.tar,.gz'
                }

            });

    // 当有文件被添加进队列的时候
    uploader.on('fileQueued', function(file) {

        //保存文件扩展名
        fileSuffix=file.ext;
        fileName=file.source['name'];
        var fileSize=file.size;
        var fileSizeStr="";
        fileSizeStr=WebUploader.Base.formatSize(fileSize);
        count++;
        $list.append(
                '<tr id="' + file.id + '" class="item" flag=0>'+
                '<td class="index">' + count + '</td>'+
                '<td class="info">' + file.name + '</td>'+
                '<td class="size">' + fileSizeStr + '</td>'+
                '<td class="state">等待上传...</td>'+
                '<td class="percentage"></td>'+
                '<td class="operate"><button name="upload" id="del'+file.id+'" class="btn btn-warning">开始</button><button name="delete" class="btn btn-error">删除</button></td></tr>'
                );
        map.put(file.id+"",file);
    });

    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function(file, percentage) {
        $('#' + file.id).find('td.percentage').text(
                '上传中 ' + Math.round(percentage * 100) + '%');
    });

    uploader.on('uploadSuccess', function(file) {
        $('#' + file.id).find('td.state').text('已上传');
    });

    uploader.on('uploadError', function(file) {
        $('#' + file.id).find('td.state').text('上传出错');
    });

    uploader.on('uploadComplete', function(file) {
        uploader.removeFile(file);
    });


    uploader.on('all', function(type) {
        if (type === 'startUpload') {
            state = 'uploading';
        } else if (type === 'stopUpload') {
            state = 'paused';
        } else if (type === 'uploadFinished') {
            state = 'done';
        }

        if (state === 'uploading') {
            $btn.text('暂停上传');
        } else {
            $btn.text('开始上传');
        }
    });

    $btn.on('click', function(){
        if (state === 'uploading'){
            uploader.stop(true);
        } else {
            uploader.upload();
        }
    });

    $("body").on("click","#uploadTable button[name='upload']",function(){
        flag=$(this).parents("tr.item").attr("flag")^1;
        $(this).parents("tr.item").attr("flag",flag);
        var id=$(this).parents("tr.item").attr("id");
        if(flag==1){
            $(this).text("暂停");
            uploader.upload(uploader.getFile(id,true));

        }
        else
        {
            $(this).text("开始");
            uploader.stop(uploader.getFile(id,true));
        }

    });

    $("body").on("click","#uploadTable button[name='delete']",function(){
        var id=$(this).parents("tr.item").attr("id");
        $(this).parents("tr.item").remove();
        uploader.removeFile(uploader.getFile(id,true));
        map.remove(id);
    });

    // 页面样式使用bootstrap模态框uploader和模态框渲染先后问题导致按钮失效，此为解决此问题
    $("#exampleModalCenter").on("shown.bs.modal",function(){  
        uploader.refresh();
    });

    $(function(){
        // 删除按钮功能
        $("body").on("click","table>tbody>tr>td .btn-danger",function(){
            let name = $(this).attr("value");
            let media_type = $(this).closest("table").attr("value");
            path = "/"+media_type+"/"+name
            $.ajax({
                url:"/upload/deletefile/",
                data:JSON.stringify(path),
                type:"post",
                dataType:"json",
                success:function(data){
                    if(data.ret == 0){
                        window.location.reload()
                    }
                    else{
                        alert(data.err)
                    }
                },
                err:function(){
                    alert("ajax err")
                },
                headers:{
                    "X-CSRFToken":token,
                }
            });
        });

    // 查看文件按钮
    $("body").on("click","table>tbody>tr>td .btn-info",function(){
        let name = $(this).attr("value");
        let media_type = $(this).closest("table").attr("value");
        let path = "/"+media_type+"/"+name
        $.ajax({
            url:"/filesystem/getmedia/",
            type:"get",
            dataType:"json",
            success:function(data){
                if(data.ret == 0){
                    window.location.href = data.path+path
                }
                else{
                    alert(data.err)
                }
            },
            err:function(){
                alert("ajax err")
            }
        });
    });

    // 下载文件
    $("body").on("click","table[value=file]>tbody>tr>td .btn-success",function(){
        let name = $(this).attr("value");
        let media_type = $(this).closest("table").attr("value");
        let path = "/"+media_type+"/"+name
        $.ajax({
            url:"/filesystem/getmedia/",
            type:"get",
            dataType:"json",
            success:function(data){
                if(data.ret == 0){
                    window.location.href = data.path+path
                }
                else{
                    alert(data.err)
                }
            },
            err:function(){
                alert("ajax err")
            }
        });
    });

    })