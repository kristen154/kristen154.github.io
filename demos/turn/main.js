$(function(){
var url = location.href.split('#')[0].toString();//url����д��
$.ajax({
        type : "get",
        url : "/wx/share.asp",
        dataType : "json",
        async : false,
        data:{url:url},
        success : function(data) {
		//console.log(data)
	wx.config({
                debug: false,////����������Ҫ�ر�debugģʽ
                appId: data.appId,//appIdͨ��΢�ŷ���ź�̨�鿴
                timestamp: data.timestamp,//����ǩ����ʱ���
                nonceStr: data.nonceStr,//����ǩ��������ַ���
                signature: data.signature,//ǩ��
                jsApiList: [//��Ҫ���õ�JS�ӿ��б�
                   'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo'
                ]
            });
		},
		error:function(xhr, status, error){
		
		}
})
    var meta = document.getElementsByTagName('meta'); 
    var share_desc = ''; 
    for(i in meta){ 
        if(typeof meta[i].name!="undefined"&&meta[i].name.toLowerCase()=="description"){ 
            share_desc = meta[i].content; //��ȡ��ҳ������Ϊ��������
        } 
    }
    var wstitle = document.title //�˴���д�������
    var wsdesc = share_desc; //�˴���д������
    var wslink = url; //�˴���ȡ��������
   // var wsimglink = document.getElementsByTagName('link');
    var wsimg = "http://www.ad100.cc/ebook/tesen/images/logo.png";
   
wx.ready(function () {
        // ��������Ȧ
        wx.onMenuShareTimeline({
                title: wstitle,
                link: wslink,
                imgUrl: wsimg,
                success: function () {
                        
                },
                cancel: function () {
                }
        });

        // ���������
        wx.onMenuShareAppMessage({
                title: wstitle,
                desc: wsdesc,
                link: wslink,
                imgUrl: wsimg,
                success: function () {
                    
                },
                cancel: function () {
                }
        });

        // ����QQ
        wx.onMenuShareQQ({
                title: wstitle,
                desc: wsdesc,
                link: wslink,
                imgUrl: wsimg,
                success: function () {
                        
                },
                cancel: function () {
                }
        });

        // ΢�ŵ���Ѷ΢��
        wx.onMenuShareWeibo({
                title: wstitle,
                desc: wsdesc,
                link: wslink,
                imgUrl: wsimg,
                success: function () {
                        
                },
                cancel: function () {
                }
        });

        // ����QQ�ռ�
        wx.onMenuShareQZone({
                title: wstitle,
                desc: wsdesc,
                link: wslink,
                imgUrl: wsimg,
                success: function () {
                        
                },
                cancel: function () {
                }
        });

});

})