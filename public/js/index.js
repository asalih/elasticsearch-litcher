var editors = [], addEditor;
$(document).ready(function() {
    
    $("#watches>tbody>tr.wRows").each(function () {
       bindRowEvents(this); 
    });
    
    
    $("#addnew").click(function () {
        $(".addRow").show();
        $(".headerRow").hide();
        
        if(addEditor == undefined){
            addEditor = CodeMirror.fromTextArea(document.getElementById("addcodeMld"), {
                matchBrackets: true,
                autoCloseBrackets: true,
                mode: "application/ld+json",
                lineWrapping: true,
                lineNumbers: true
            });
        }
    });
    
    $("#addSave").click(function () {
        
        callSave($("#addKey").val(), addEditor.getValue(), this, true);
        $(".addRow").hide();
        $(".headerRow").show();
        
    });
    
    $("#addCancel").click(function () {
        $("#addKey").val("");
        addEditor.setValue("")
        $(".addRow").hide();
        $(".headerRow").show();
    });
    
});

function call(key, url, item) {
    $.ajax({
        url: "/" + url,
        type: "POST",
        data: JSON.stringify({ key: key }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        i: item,
        success: function (params) {
            if(params === true){
                var curr = $(this.i).parents("td").attr("data-state");
                
                if(curr == "true"){
                    $(this.i).parents("td").attr("data-state", "false")
                    $(this.i).removeClass("btn-default").addClass("btn-success").find("i").removeClass("glyphicon-pause").addClass("glyphicon-play");
                    $(this.i).parents("tr").find(":first>i").removeClass("bs-active").addClass("bs-default");
                }
                else{
                    $(this.i).parents("td").attr("data-state", "true")
                    $(this.i).removeClass("btn-success").addClass("btn-default").find("i").removeClass("glyphicon-play").addClass("glyphicon-pause");
                    $(this.i).parents("tr").find(":first>i").removeClass("bs-default").addClass("bs-active");
                }
            }
            
            
        },
        error: function (ex) {
            console.log("error" + ex);         
        }
    });
}

function callDelete(key, item) {
    if(confirm("Watch will be deleted?")){
        $.ajax({
            url: "/delete",
            type: "POST",
            data: JSON.stringify({ key: key }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            i: item,
            success: function (params) {
                if(params === true){
                    $(this.i).parents("tr").remove();
                }
                else{
                    console.log(params);
                }
            },
            error: function (ex) {
                console.log("error" + ex);         
            }
        });
    }
}

function callSave(key, body, item, adding) {
    if(confirm("Do you want to save?")){
        $.ajax({
            url: "/createOrUpdateWatch",
            type: "POST",
            data: JSON.stringify({ key: key, body: body }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            props: { i: item, adding: adding, key: key},
            success: function (params) {
                if(params === true){
                    $(this.props.i).parents("tr").hide();
                    if(this.props.adding){
                        getRow(key);
                    }
                }
                else{
                    alert(params.e);
                    console.log(params);
                }
            },
            error: function (ex) {
                console.log("error" + ex);         
            }
        });
    }
}

function getRow(key) {
    $.ajax({
            url: "/getRow?key=" + key,
            type: "GET",
            success: function (params) {
                var rows = $(params).appendTo($("#watches>tbody"));
                bindRowEvents(rows[0]);
            },
            error: function (ex) {
                console.log("error" + ex);         
            }
        });
    }

function bindRowEvents(item) {
    $(item).find(".btn-tgl").click(function () {
        var el = $(this).parents("td")
        var key = el.attr("data-key");
        var state = el.attr("data-state");
        var url;
        
        if(state == "true"){
            url = "stop";
        }
        else{
            url = "start";
        }
        
        call(key, url, this);
    });
    
    $(item).find(".wdelete").click(function () {
        callDelete($(this).parents("td").attr("data-key"), this);
    });
    

    $(item).find(".wedit").click(function () {
        var el = $(this).parents("td");
        var eltr = el.parent().next();
        eltr.show();
        
        
        if(!el.attr("init")){
            var key = el.attr("data-key");
            editors[key] = CodeMirror.fromTextArea(eltr.find("textarea")[0], {
                matchBrackets: true,
                autoCloseBrackets: true,
                mode: "application/ld+json",
                lineWrapping: true,
                lineNumbers: true
            });
            el.attr("init", true);
        }
        
    });
    
    $(item).next().find(".btnSave").click(function () {
        var key = $(this).parents("td").attr("data-key");
        callSave(key, editors[key].getValue(), this);
    });
    
    $(item).next().find(".btnCancel").click(function () {
        $(this).parents("tr").hide();
    });
}