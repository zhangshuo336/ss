var cpu_echarts
var memory_echarts
var disk_echarts
var china_echarts
var humidity_echarts
var temperature_echarts
var cpu_temperature_echarts

// echarts title字体大小
var title_font_size = 20
// echarts title字典颜色
var title_font_color = "#fff"
var server_time = 0

$(function(){

	memory_echarts = echarts.init(document.getElementById('memory_info'));
	memory_echarts.setOption(set_memory_option());

	cpu_echarts = echarts.init(document.getElementById('cpu_info'));
    cpu_echarts.setOption(set_cpu_option());
    
	disk_echarts = echarts.init(document.getElementById('disk_info'));
    disk_echarts.setOption(set_disk_option());

    cpu_temperature_echarts = echarts.init(document.getElementById('cpu_temperature_info'));
	cpu_temperature_echarts.setOption(set_cpu_temperature_option());
    
    humidity_echarts = echarts.init(document.getElementById('humidity'));
    humidity_echarts.setOption(set_humidity_option());
    
    temperature_echarts = echarts.init(document.getElementById('temperature'));
	temperature_echarts.setOption(set_temperature_option());

	china_echarts = echarts.init(document.getElementById('map_info'));
    china_echarts.setOption(set_china_option());
    
    line_echarts = echarts.init(document.getElementById('temperature_humidity_line_info'));
	line_echarts.setOption(set_temperature_humidity_line());

//   初始加载echarts图
  load_data()
//   图每5秒更新一次
  setInterval(load_data,5000);
  setInterval(time_set,1000);

});


function load_data(){
    $.ajax({
      type:"get",
      dataType:"json",
      sync:false,
      url:"/get_host_info/",
      success:function(data){
        // console.log(data)
        let color_list_cpu = ["#10bb1c", "#fff"]
        // if(data.cpu_info.percent > 20 ){
        //     color_list_cpu = ["#7bde23", "#fff"]
        // }
        if(data.cpu_info.percent > 40 ){
            color_list_cpu = ["#18c3f8", "#fff"]
        }
        
        if(data.cpu_info.percent > 80 ){
            color_list_cpu = ["#fec620", "#fff"]
        }
        if(data.cpu_info.percent > 95 ){
            color_list_cpu = ["#f8625a", "#fff"]
        }
        cpu_echarts.setOption(
            
            {
                color :color_list_cpu,
                series:[
                        {
                            data:[
                                {value:data.cpu_info.percent,"name":"已用"},
                                {value:100-data.cpu_info.percent,"name":"剩余"},
                        ]
                    }
                ]
            }
        )

        let color_list_memory = ["#10bb1c", "#fff"]
        // if(data.memory.percent > 20 ){
        //     color_list_memory = ["#7bde23", "#fff"]
        // }
        if(data.memory.percent > 40 ){
            color_list_memory = ["#18c3f8", "#fff"]
        }
        
        if(data.memory.percent > 80 ){
            color_list_memory = ["#fec620", "#fff"]
        }
        if(data.memory.percent > 95 ){
            color_list_memory = ["#f8625a", "#fff"]
        }
        memory_echarts.setOption({
            series:[
                    {
                        color: color_list_memory,
                        data:[
                            {value:data.memory.percent,"name":"已用"},
                            {value:100-data.memory.percent,"name":"剩余"},
                    ]
                }
            ]
        })
		$("#total_memory").html(unit_formatter(data.memory.total))
		$("#used_memory").html(unit_formatter(data.memory.used))
		$("#avail_memory").html(unit_formatter(data.memory.available)+"/"+unit_formatter(data.memory.total))
        $("#cpu_temperature").html(data.cpu_info.temperature.toFixed(1)+"℃")
        let color_list_disk = ["#10bb1c", "#fff"]
        
        if((data.disk.used/(data.disk.used+data.disk.available))*100 > 40 ){
            color_list_disk = ["#18c3f8", "#fff"]
        }
        
        if((data.disk.used/(data.disk.used+data.disk.available))*100 > 80 ){
            color_list_disk = ["#fec620", "#fff"]
        }
        if((data.disk.used/(data.disk.used+data.disk.available))*100 > 95 ){
            color_list_disk = ["#f8625a", "#fff"]
        }
		disk_echarts.setOption(
                {
                    color: color_list_disk,
                    series:[{data:[
                        {value:data.disk.used,name:"已用"},
                        {value:data.disk.available,name:"剩余"}
                    ]}]
                }
        );
        let color_list_temperature = ["#10bb1c", "#fff"]
        if(data.cpu_info.temperature.toFixed(1) > 40 ){
            color_list_temperature = ["#18c3f8", "#fff"]
        }
        
        if(data.cpu_info.temperature.toFixed(1) > 80 ){
            color_list_temperature = ["#fec620", "#fff"]
        }
        if(data.cpu_info.temperature.toFixed(1) > 95 ){
            color_list_temperature = ["#f8625a", "#fff"]
        }
        cpu_temperature_echarts.setOption(
            {
                color: color_list_temperature,
                series:[{data:[
                    {value:data.cpu_info.temperature.toFixed(1)},
                    {value:100-data.cpu_info.temperature.toFixed(1)}
                ]}]
            }
        );
		$("#total_disk").html(unit_formatter(data.disk.total))
		$("#used_disk").html(unit_formatter(data.disk.used))
        $("#avail_disk").html(unit_formatter(data.disk.available)+"/"+unit_formatter(data.disk.total))
        
        // $("#current_time").html(data.time)
        if(server_time == 0){
            server_time = data.time*1000
        }
		$("#boot_time").html(data.boot_time)
		// $("#recv_package").html(data.network.packets_recv)
		// $("#sent_package").html(data.network.packets_sent)
		$("#terminal_num").html(data.users)
        temperature_echarts.setOption({
            series:[{data:[parseInt(data.temperature+30)]}]
        })
        humidity_echarts.setOption({series:{data:[data.humidity/100]}})
        line_echarts.setOption({
            xAxis:{data:data.t_h_time_list},
            series:[{data:data.t_list}]
        });
        
	},
      error:function(){
        
      }
    });
}

function time_set(){
    if(server_time !== 0){
        server_time += 1000
        let date = new Date(server_time);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        let week = "日一二三四五六".split("")[date.getDay()];
        let time_str = year+"-"+time_format(month)+"-"+time_format(day)+" "+time_format(hour)+":"+time_format(minute)+":"+time_format(second)+" "+week
        $("#current_time").html(time_str)
    }
}

function time_format(num){
    if(num<10){
        return "0"+num
    }
    else{
        return num
    }
}




// ------------------------------------------------------------
function unit_formatter(num){
	let unit_list = ["B","KB","MB","GB","TB"];
	let flag = 0;
	while(num >= 1024){
		num /= 1024.0
		flag += 1
	}
	return num.toFixed(2)+unit_list[flag]
}

// CPU温度echarts图
function set_cpu_temperature_option(){
    let cpu_temperature_option = {
        color:['#10bb1c','#fff'],
        title: {
            text: "CPU温度",
            x: 'center',
            y: 'top',
            textStyle: {
                fontWeight: 'normal',
                color: title_font_color,
                fontSize: title_font_size,
            }
        },
        // tooltip: {
        //     trigger: 'item',
        //     formatter: '{a} <br/>{b}: {c}'
        // },
        legend: {
            orient: 'horizontal',
            left:'center',
            bottom: 2,
            data: ['温度','温度'],
            textStyle:{
                color:'#fff'
            },
            // color:['#16d29b','#d21661']
        },
        series: [
            {
                name: '温度',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '15',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                   
                ]
            }
        ]
    };
    return cpu_temperature_option
}

// 内存echarts图
function set_memory_option(){
  let memory_option = {
    color:['#10bb1c','#fff'],
    title: {
        text: "内存信息",
		x: 'center',
		y: 'top',
		textStyle: {
			fontWeight: 'normal',
			color: title_font_color,
			fontSize: title_font_size,
		}
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {d}%'
    },
    legend: {
        orient: 'horizontal',
        left:'center',
        bottom: 2,
        data: ['已用','剩余'],
        textStyle:{
            color:'#fff'
        },
        color:['#16d29b','#d21661']
    },
    series: [
        {
            name: '大小',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '15',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
               
            ]
        }
    ]
};

  return memory_option
}

// CPUecharts图
function set_cpu_option(){
  let cpu_option = {
    color:['#10bb1c','#fff'],
    title: {
        text: "CPU",
		x: 'center',
		y: 'top',
		textStyle: {
			fontWeight: 'normal',
			color: title_font_color,
			fontSize: title_font_size,
		}
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {d}%'
    },
    legend: {
        orient: 'horizontal',
        left:'center',
        bottom: 2,
        data: ['已用','剩余'],
        textStyle:{
            color:'#fff'
        },
        color:['#16d29b','#d21661']
    },
    series: [
        {
            name: '大小',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '15',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
               
            ]
        }
    ]
};
  return cpu_option
}

// 磁盘echarts图
function set_disk_option(){
	
  let disk_option = {
    color:['#301ee5','#fff'],
	title: {
		text: "磁盘信息",
		x: 'center',
		y: 'top',
		textStyle: {
			fontWeight: 'normal',
			color: title_font_color,
			fontSize: title_font_size,
		}
	},
      tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {d}%'
      },
      legend: {
          orient: 'horizontal',
          left:'center',
          bottom: 2,
          data: ['已用','剩余'],
          textStyle:{
              color:'#fff'
          },
          color:['#16d29b','#d21661']
      },
      series: [
          {
              name: '大小',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                  normal: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      show: true,
                      textStyle: {
                          fontSize: '15',
                          fontWeight: 'bold'
                      }
                  }
              },
              labelLine: {
                  normal: {
                      show: false
                  }
              },
              data: [
                  
              ]
          }
      ]
  };
  return disk_option
}

// 配合中国地图生成随机数据
function randomData() {  
	return Math.round(Math.random()*500);  
}

// 中国地图
function set_china_option(){

	var mydata = [  
		{name: '北京',value: '100' },{name: '天津',value: randomData() },  
		{name: '上海',value: randomData() },{name: '重庆',value: randomData() },  
		{name: '河北',value: randomData() },{name: '河南',value: randomData() },  
		{name: '云南',value: randomData() },{name: '辽宁',value: randomData() },  
		{name: '黑龙江',value: randomData() },{name: '湖南',value: randomData() },  
		{name: '安徽',value: randomData() },{name: '山东',value: randomData() },  
		{name: '新疆',value: randomData() },{name: '江苏',value: randomData() },  
		{name: '浙江',value: randomData() },{name: '江西',value: randomData() },  
		{name: '湖北',value: randomData() },{name: '广西',value: randomData() },  
		{name: '甘肃',value: randomData() },{name: '山西',value: randomData() },  
		{name: '内蒙古',value: randomData() },{name: '陕西',value: randomData() },  
		{name: '吉林',value: randomData() },{name: '福建',value: randomData() },  
		{name: '贵州',value: randomData() },{name: '广东',value: randomData() },  
		{name: '青海',value: randomData() },{name: '西藏',value: randomData() },  
		{name: '四川',value: randomData() },{name: '宁夏',value: randomData() },  
		{name: '海南',value: randomData() },{name: '台湾',value: randomData() },  
		{name: '香港',value: randomData() },{name: '澳门',value: randomData() }  
	]; 

	let china_option = {  
		// backgroundColor: '#FFFFFF',  
		title: {  
			text: '全国地图大数据',  
			subtext: '',  
            x:'center',
            textStyle: {
                fontWeight: 'normal',
                color: title_font_color,
                fontSize: title_font_size,
            }
		},  
		//左侧小导航图标
		visualMap: {  
            textStyle:{
                color:'#fff'
            },
			show : true,  
			x: 'left',  
			y: 'center',  
			splitList: [   
				{start: 500, end:600},{start: 400, end: 500},  
				{start: 300, end: 400},{start: 200, end: 300},  
				{start: 100, end: 200},{start: 0, end: 100},  
			],  
			color: ['#db2f3b', '#db602f', '#dbd92f','#2f70db', '#2fdb43', '#ffffff']  
		},  
		//配置属性
		series: [{  
			name: '数据',  
			type: 'map',  
			mapType: 'china',   
			roam: true,  
			label: {  
				normal: {  
					show: true  //省份名称  
				},  
				emphasis: {  
					show: false  
				}  
			},  
			data:mydata  //数据
		}]  
	};

	return china_option;
}

// 温度echarts
function set_temperature_option(){
    var value = 30.0;
    var kd = [];
    // 刻度使用柱状图模拟，短设置3，长的设置5；构造一个数据
    for (var i = 0, len = 130; i <= len; i++) {
        if (i > 100 || i < 30) {
            kd.push('0')
        } else {
            if (i % 5 === 0) {
                kd.push('5');
            } else {
                kd.push('3');
            }
        }

    }
    var mercuryColor = '#fd4d49';
    var borderColor = '#fd4d49';

    var temperature_option = {
        title: {
            text: "温度信息",
            x: 'center',
            y: 'top',
    
            textStyle: {
                fontWeight: 'normal',
                color: title_font_color,
                fontSize: title_font_size,
            }
        },
        yAxis: [{
            show: false,
            min: 0,
            max: 130,
        }, {
            show: false,
            data: [],
            min: 0,
            max: 130,
        }],
        xAxis: [{
            show: false,
            data: []
        }, {
            show: false,
            data: []
        }, {
            show: false,
            data: []
        }, {
            show: false,
            min: -110,
            max: 100,

        }],
        series: [{
            name: '条',
            type: 'bar',
            // 对应上面XAxis的第一个对象配置
            xAxisIndex: 0,
            data: value,
            barWidth: 18,
            itemStyle: {
                normal: {
                    color: mercuryColor,
                    barBorderRadius: 0,
                }
            },
            label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: function(param) {
                        // 因为柱状初始化为0，温度存在负值，所以，原本的0-100，改为0-130，0-30用于表示负值
                        return param.value - 30 + '°C';
                    },
                    textStyle: {
                        color: '#000',
                        fontSize: '10',
                    }
                }
            },
            z: 2
        }, {
            name: '白框',
            type: 'bar',
            xAxisIndex: 1,
            barGap: '-100%',
            data: [129],
            barWidth: 28,
            itemStyle: {
                normal: {
                    color: '#ffffff',
                    barBorderRadius: 50,
                }
            },
            z: 1
        }, {
            name: '外框',
            type: 'bar',
            xAxisIndex: 2,
            barGap: '-100%',
            data: [130],
            barWidth: 38,
            itemStyle: {
                normal: {
                    color: borderColor,
                    barBorderRadius: 50,
                }
            },
            z: 0
        }, {
            name: '圆',
            type: 'scatter',
            hoverAnimation: false,
            data: [0],
            xAxisIndex: 0,
            symbolSize: 48,
            itemStyle: {
                normal: {
                    color: mercuryColor,
                    opacity: 1,
                }
            },
            z: 2
        }, {
            name: '白圆',
            type: 'scatter',
            hoverAnimation: false,
            data: [0],
            xAxisIndex: 1,
            symbolSize: 60,
            itemStyle: {
                normal: {
                    color: '#ffffff',
                    opacity: 1,
                }
            },
            z: 1
        }, {
            name: '外圆',
            type: 'scatter',
            hoverAnimation: false,
            data: [0],
            xAxisIndex: 2,
            symbolSize: 70,
            itemStyle: {
                normal: {
                    color: borderColor,
                    opacity: 1,
                }
            },
            z: 0
        }, {
            name: '刻度',
            type: 'bar',
            yAxisIndex: 1,
            xAxisIndex: 3,
            label: {
                normal: {
                    show: true,
                    position: 'right',
                    distance: 15,
                    color: '#000',
                    fontSize: 10,
                    formatter: function(params) {
                        // 因为柱状初始化为0，温度存在负值，所以，原本的0-100，改为0-130，0-30用于表示负值
                        if (params.dataIndex > 100 || params.dataIndex < 30) {
                            return '';
                        } else {
                            if (params.dataIndex % 5 === 0) {
                                return params.dataIndex - 30;
                            } else {
                                return '';
                            }
                        }
                    }
                }
            },
            barGap: '-100%',
            data: kd,
            barWidth: 1,
            itemStyle: {
                normal: {
                    color: borderColor,
                    barBorderRadius: 10,
                }
            },
            z: 0
        }]
    };
    return temperature_option
}

// 湿度echarts图
function set_humidity_option(){
    var humidity_option = {
        title: {
            text: "湿度信息",
            x: 'center',
            y: 'top',
    
            textStyle: {
                fontWeight: 'normal',
                color: title_font_color,
                fontSize: title_font_size,
            }
        },
        series: {
            type: 'liquidFill',
            data: [0.0],
            radius: '120%',
            shape: 'pin',
            center: ['50%', '45%'],
            outline: {
                show: false
            },
            backgroundStyle: {
                borderColor: '#156ACF',
                borderWidth: 2,
                shadowColor: 'rgba(0, 0, 0, 0.4)',
                shadowBlur: 20,
            },
        }
    };
    return humidity_option
}

function set_temperature_humidity_line(){
    var temperature_humidity_line_option = {
        
        title: {
            text: "温度曲线",
            x: 'center',
            y: 'top',
            textStyle: {
                fontWeight: 'normal',
                color: title_font_color,
                fontSize: title_font_size,
            }
        },
        grid: {
            top: '20%',
            left: '10%',
            right: '10%',
            bottom: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLabel: {
                margin: 30,
                color: '#ffffff63'
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: true,
                length: 25,
                lineStyle: {
                    color: "#ffffff1f"
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#ffffff1f'
                }
            }
        },
        yAxis: [{
            type: 'value',
            position: 'right',
            axisLabel: {
                margin: 20,
                color: '#ffffff63'
            },
    
            axisTick: {
                show: true,
                length: 15,
                lineStyle: {
                    color: "#ffffff1f",
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#ffffff1f'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#fff',
                    width: 2
                }
            }
        }],
        series: [{
            name: '温度',
            type: 'line',
            smooth: true, //是否平滑曲线显示
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    color: "#fff", // 线条颜色
                },
            },
            label: {
                show: true,
                position: 'top',
                textStyle: {
                    color: '#fff',
                }
            },
            itemStyle: {
                color: "red",
                borderColor: "#fff",
                borderWidth: 3
            },
            tooltip: {
                show: false
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#eb64fb'
                        },
                        {
                            offset: 1,
                            color: '#3fbbff0d'
                        }
                    ], false),
                }
            },
            data: []
        }]
    };
    return temperature_humidity_line_option
}