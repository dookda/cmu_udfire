let geoserver = "http://150.95.80.114:8080/geoserver"

const map = L.map('map', {
    center: [17.868925397129943, 100.31221166785994],
    zoom: 11
})

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    lyr: 'basemap'
});

const CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    lyr: 'basemap'
});

const grod = L.tileLayer('https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

const ghyb = L.tileLayer('https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var prov = L.tileLayer.wms("https://rti2dss.com/geoserver/th/wms?", {
    layers: 'th:province_4326',
    format: 'image/png',
    transparent: true,
    CQL_FILTER: 'pro_code=53'
});

const amp = L.tileLayer.wms("https://rti2dss.com/geoserver/th/wms?", {
    layers: 'th:amphoe_4326',
    format: 'image/png',
    transparent: true,
    CQL_FILTER: 'pro_code=53'
});

const tam = L.tileLayer.wms("https://rti2dss.com/geoserver/th/wms?", {
    layers: 'th:tambon_4326',
    format: 'image/png',
    transparent: true,
    CQL_FILTER: 'pro_code=53'
});

const baseMap = {
    "OSM": osm,
    "แผนที่ CartoDB": CartoDB.addTo(map),
    "แผนที่ถนน": grod,
    "แผนที่ภาพถ่าย": ghyb
}

const overlayMap = {
    "ขอบจังหวัด": prov,
    "ขอบอำเภอ": amp.addTo(map),
    "ขอบตำบล": tam.addTo(map)
}

L.control.layers(baseMap, overlayMap).addTo(map);

let wmsList = [];
axios.get('/api/listndvi').then((res) => {
    res.data.layers.layer.forEach(i => {
        wmsList.push(i.name);
    });
});

let wmsLyr = [];
const addLayer = async (e) => {
    wmsLyr = [];
    document.getElementById("datefocus").value = e.target.value;
    let dtxt = "ndvi_" + e.target.value.replace("-", "").replace("-", "");
    wmsLyr.push(`ndvi:${dtxt}`)
    await map.eachLayer(i => {
        if (i.options.name == "ndvi") {
            map.removeLayer(i)
        }
    })

    let lyr = await L.tileLayer.wms(geoserver + "/wms?", {
        layers: 'ndvi:' + dtxt,
        format: "image/png",
        transparent: true,
        styles: "ndvi",
        zIndex: 3,
        name: "ndvi"
    })

    if (wmsList.includes(wmsLyr[0])) {
        lyr.addTo(map)
    }
}

let ndviItem = document.getElementById('ndvidate');
ndviItem.onchange = addLayer;

var dom = document.getElementById('chart');
var echart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});

// option = {
//     title: {
//         text: 'NDVI 2022'
//     },
//     tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//             type: 'cross',
//             label: {
//                 backgroundColor: '#6a7985'
//             }
//         }
//     },
//     xAxis: {
//         type: 'category',
//         data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         name: 'Date of Year (DOY)',
//         nameLocation: 'center',
//         nameGap: 30,
//     },
//     yAxis: {
//         type: 'value',
//         name: 'NDVI',
//         nameLocation: 'center',
//         nameGap: 30,
//     },
//     series: [
//         {
//             data: [820, 932, 901, 934, 1290, 1330, 1320],
//             type: 'line',
//             smooth: true,
//             symbol: 'none',
//         }
//     ]
// };

var option = {
    grid: {
        top: '10%',
        bottom: '10%',
        left: '15%',
        right: '5%',
    },
    xAxis: {
        type: 'category',
        name: 'Date',
        nameLocation: 'center',
        nameGap: 30,
    },
    yAxis: {
        type: 'value',
        max: 1,
        name: 'NDVI',
        nameLocation: 'center',
        nameGap: 30,
    },
    series: [
        {
            // data: [120],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
            }
        }
    ]
};

if (option && typeof option === 'object') {
    echart.setOption(option);
}

window.addEventListener('resize', echart.resize);

map.on("click", async (e) => {
    let lyrs = wmsLyr.toString();
    let pnt = await map.latLngToContainerPoint(e.latlng, map.getZoom());
    let size = await map.getSize();
    let bbox = await map.getBounds().toBBoxString();
    let datefocus = document.getElementById("datefocus").value

    let lyrInfoUrl = geoserver + "/wms?SERVICE=WMS" +
        "&VERSION=1.1.1&REQUEST=GetFeatureInfo" +
        "&QUERY_LAYERS=" + lyrs +
        "&LAYERS=" + lyrs +
        "&Feature_count=300" +
        "&INFO_FORMAT=application/json" +
        "&X=" + Math.round(pnt.x) +
        "&Y=" + Math.round(pnt.y) +
        "&SRS=EPSG:4326" +
        "&WIDTH=" + size.x +
        "&HEIGHT=" + size.y +
        "&BBOX=" + bbox;
    // console.log(lyrInfoUrl);
    let xAxis = [];
    let series = [];
    await axios.get(lyrInfoUrl).then(async (r) => {
        if (r.data.features) {
            r.data.features.map(async (i, k) => {
                document.getElementById("ndvitxt").innerHTML = `<div class="desc">lat: ${e.latlng.lat} 
                <br>lon: ${e.latlng.lng}
                <br>NDVI: ${i.properties.GRAY_INDEX.toFixed(3)} 
                <br>วันที่: ${datefocus}`;
                xAxis.push(k);
                series.push(i.properties.GRAY_INDEX.toFixed(3));
            })

            await echart.setOption({
                xAxis: {
                    type: 'category',
                    data: [datefocus],
                },
                yAxis: {
                    type: 'value',
                    max: 1,
                    min: -1,
                },
                series: [
                    {
                        data: series,
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)'
                        }
                    }
                ]
            })
        }
    })
})

